# Packages -----
library("pacman")
p_load(magrittr, data.table, knitr, stringr, jsonlite, shiny)

# Define UI for data upload app ----
ui <- fluidPage(
  
  # App title ----
  titlePanel("Preprocess DICE Data"),
  
  # Sidebar layout with input and output definitions ----
  sidebarLayout(
    
    # Sidebar panel for inputs ----
    sidebarPanel(
      
      # Input: Select a file ----
      fileInput("file1", "Choose CSV File",
                multiple = FALSE,
                accept = c("text/csv",
                           "text/comma-separated-values,text/plain",
                           ".csv")),
      
      tags$hr(),
      
      # Input: Select number of rows to display ----
      radioButtons("disp", "Display Data",
                   choices = c(`First 6 Rows` = "head",
                               `All Rows` = "all"),
                   selected = "head"),
      
      tags$hr(),
      
      # Download Button
      downloadButton("downloadData", "Download Processed Data")
    ),
    
    # Main panel for displaying outputs ----
    mainPanel(
      # Output: Data file ----
      tableOutput("contents")
    )
  )
)

# Define server logic ----
server <- function(input, output) {
  
  # Define 'final' as a reactive expression
  final <- reactive({
    req(input$file1)
    
    tryCatch({
      df <- fread(input$file1$datapath) %>%
        as.data.table()
    }, error = function(e) {
      stop(safeError(e))
    })
    
    # Preprocessing: select cols and only complete observations
    cols <- str_detect(string = names(df),
                       pattern = "session.code|participant.label|participant.code|likes_data|replies_data|sequence|viewport|promoted|rowheight|sponsored|condition|device_type|touch_capability|time_started")
    data <- df[participant._index_in_pages >= 4, ..cols]
    
    # Preprocessing: rename cols
    names(data) %>%
      str_replace_all(pattern = ".*player\\.", replacement = "") %>%
      str_replace_all(pattern = "\\.", replacement = "_") %>%
      str_replace_all(pattern = "feed_", replacement = "") %>%
      str_to_lower() %>%
      setnames(x = data)
    
    # Edit Date Format
    data[, participant_time_started_utc := participant_time_started_utc %>% str_sub(start = 1, end = 19)]
    
    # Create Item Sequence DT
    display <- data[,
                    .(tweet = unlist(base::strsplit(x = sequence,
                                                    split = ", ")) %>%
                        as.integer()),
                    by = participant_code]
    
    display[, displayed_sequence := 1:.N, by = participant_code]
    
    # Create Flow (Scroll Sequence DT)
    flow_collapsed <- data.table(participant_code = character(),
                                 tweet = integer(),
                                 scroll_sequence = character())
    
    tryCatch({
      sequence <- data[nchar(viewport_data) > 1,
                       viewport_data %>%
                         str_replace_all(pattern = '""',
                                         replacement = '"') %>%
                         fromJSON,
                       by = participant_code][!is.na(doc_id)][, scroll_sequence := 1:.N, by = participant_code]
      
      setnames(sequence, old = 'doc_id', new = 'tweet')
      
      flow <- sequence[display, on = .(participant_code, tweet)]
      
      flow[, duplicate := duplicated(tweet), by = participant_code]
      
      setorder(flow, participant_code, scroll_sequence)
      
      flow_collapsed <- flow[,
                             .(scroll_sequence = paste(scroll_sequence, collapse = ",")),
                             by = .(participant_code, tweet)]
      
      flow_collapsed[scroll_sequence == "NA", scroll_sequence := NA]
    }, error = function(e) {
      # Keep empty flow_collapsed if parsing fails
      NULL
    })
    
    # Create Dwell Time DT
    viewport <- data.table(participant_code = character(),
                           tweet = integer(),
                           seconds_in_viewport = numeric())
    
    tryCatch({
      viewport_temp <- data[nchar(viewport_data) > 1,
                            fromJSON(str_replace_all(string = viewport_data,
                                                     pattern = '""',
                                                     replacement = '"')),
                            by = participant_code][!is.na(doc_id)]
      
      # Sum durations by tweet (in case someone scrolled back and forth)
      viewport <- viewport_temp[,
                                .(seconds_in_viewport = sum(duration,
                                                            na.rm = TRUE)),
                                by = c('participant_code', 'doc_id')]
      
      # Rename
      setnames(x = viewport,
               old = 'doc_id',
               new = 'tweet')
    }, error = function(e) {
      # Keep empty viewport if parsing fails
      NULL
    })
    
    # Create Reactions DT
    reactions <- data.table(participant_code = character(),
                            tweet = integer(),
                            liked = logical(),
                            replies = logical())
    
    tryCatch({
      likes <- data[nchar(likes_data) > 1,
                    fromJSON(str_replace_all(string = likes_data,
                                             pattern = '""',
                                             replacement = '"')),
                    by = participant_code][!is.na(doc_id)]
      
      if(data[nchar(replies_data) > 3, .N] > 0){
        tryCatch({
          replies <- data[nchar(replies_data) > 3,
                          fromJSON(str_replace_all(string = replies_data,
                                                   pattern = '""',
                                                   replacement = '"')),
                          by = participant_code][!is.na(doc_id)]
          reactions <- merge(likes, replies, by = c("participant_code", "doc_id"), all = TRUE)
        }, error = function(e) {
          # If replies parsing fails, just use likes
          reactions <<- likes
          reactions[, replies := NA]
        })
      } else {
        reactions <- likes
        reactions[, replies := NA]
      }
      
      # Make sure doc_id is numeric as is the case for the other data.tables
      reactions[, doc_id := as.numeric(doc_id)]
      
      # Rename
      setnames(x = reactions,
               old = 'doc_id',
               new = 'tweet')
    }, error = function(e) {
      # Keep empty reactions if parsing fails
      NULL
    })
    
    # Create Rowheight DT
    rowheight <- data.table(participant_code = character(),
                            tweet = integer(),
                            height = numeric())
    
    tryCatch({
      rowheight_temp <- data[nchar(rowheight_data) > 1,
                             fromJSON(str_replace_all(string = rowheight_data,
                                                      pattern = '""',
                                                      replacement = '"')),
                             by = participant_code][!is.na(doc_id)]
      
      # Rename
      setnames(x = rowheight_temp,
               old = 'doc_id',
               new = 'tweet')
      
      rowheight <- rowheight_temp
    }, error = function(e) {
      # Keep empty rowheight if parsing fails
      NULL
    })
    
    # Create Sponsored Post (Ad) Clicks
    ad_clicks <- data.table(participant_code = character(),
                            tweet = integer(),
                            clicked = logical())
    
    tryCatch({
      ad_clicks_temp <- data[nchar(promoted_post_clicks) > 1,
                             fromJSON(str_replace_all(string = promoted_post_clicks,
                                                      pattern = '""',
                                                      replacement = '"')),
                             by = participant_code][!is.na(doc_id)]
      
      # Rename
      setnames(x = ad_clicks_temp,
               old = 'doc_id',
               new = 'tweet')
      
      ad_clicks <- ad_clicks_temp
    }, error = function(e) {
      # Keep empty ad_clicks if parsing fails
      NULL
    })
    
    # Merge to Final DT
    merge_1 <- merge(data[, .(session_code, participant_code, participant_label, touch_capability, device_type, condition, participant_time_started_utc)], display, by = c("participant_code"), all = TRUE)
    merge_2 <- merge(merge_1, viewport, by = c("participant_code", "tweet"), all = TRUE)
    merge_3 <- merge(merge_2, flow_collapsed, by = c("participant_code", "tweet"), all = TRUE)
    merge_4 <- merge(merge_3, reactions, by = c("participant_code", "tweet"), all = TRUE)
    merge_5 <- merge(merge_4, ad_clicks, by = c("participant_code", "tweet"), all = TRUE)
    tmp     <- merge(merge_5, rowheight, by = c("participant_code", "tweet"), all = TRUE)
    
    # Reorder columns (and rows)
    new_order <- c(3, 1, 4, 8, 5, 6, 7)
    remaining_cols <- setdiff(1:ncol(tmp), new_order)
    final <- tmp[, c(new_order, remaining_cols), with = FALSE]
    setorder(final, session_code, participant_code, displayed_sequence)
    
    # Re-re-name
    setnames(x = final,
             new = 'doc_id',
             old = 'tweet')
    
    # Replace click-NAs with FALSE
    if("clicked" %in% names(final)) {
      final[is.na(clicked), clicked := FALSE]
    }
    
    return(final)
  })
  
  output$contents <- renderTable({
    if(input$disp == "head") {
      head(final())
    } else {
      final()
    }
  })
  
  output$downloadData <- downloadHandler(
    filename = function() {
      paste("DICE-processed-", Sys.Date(), ".csv", sep="")
    },
    content = function(file) {
      write.csv(final(), file, row.names = FALSE)
    }
  )
}

# Create Shiny app ----
shinyApp(ui, server)