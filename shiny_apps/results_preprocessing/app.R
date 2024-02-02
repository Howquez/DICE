# Pakages -----
library("pacman")
p_load(magrittr, data.table, knitr, stringr, jsonlite)


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
      
      # Horizontal line ----
      tags$hr(),
      
      # # Input: Checkbox if file has header ----
      # checkboxInput("header", "Header", TRUE),
      # 
      # # Input: Select separator ----
      # radioButtons("sep", "Separator",
      #              choices = c(Comma = ",",
      #                          Semicolon = ";",
      #                          Tab = "\t"),
      #              selected = ","),
      # 
      # # Input: Select quotes ----
      # radioButtons("quote", "Quote",
      #              choices = c(None = "",
      #                          "Double Quote" = '"',
      #                          "Single Quote" = "'"),
      #              selected = '"'),
      # 
      # # Horizontal line ----
      # tags$hr(),
      
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

# Define server logic to read selected file ----
server <- function(input, output) {
  
  output$contents <- renderTable({
    
    # input$file1 will be NULL initially. After the user selects
    # and uploads a file, head of that data file by default,
    # or all rows if selected, will be shown.
    
    req(input$file1)
    
    # when reading semicolon separated files,
    # having a comma separator causes `read.csv` to error
    tryCatch(
      {
        df <- data.table::fread(input$file1$datapath,
                       # header = input$header,
                       # sep = input$sep,
                       # quote = input$quote,
                       skip = "participant.tweets",
                       ) %>% 
          as.data.table()
      },
      error = function(e) {
        # return a safeError if a parsing error occurs
        stop(safeError(e))
      }
    )
    
    # Preprocessing: select cols and only complete observations
    cols <- str_detect(string = names(df), 
                       pattern = "participant.label|participant.code|likes_data|replies_data|favorable|sequence|viewport|condition")
    
    data <- df[participant._index_in_pages >= 4, ..cols]
    
    # Preprocessing: rename cols
    names(data) %>%
      str_replace_all(pattern = ".*player\\.", replacement = "") %>%
      str_replace_all(pattern = "\\.", replacement = "_") %>%
      str_replace_all(pattern = "feed_", replacement = "") %>%
      str_to_lower() %>%
      setnames(x = data)
    
    # Create Item Sequence DT
    display <- data[, 
                    .(tweet = unlist(base::strsplit(x = sequence, 
                                                    split = ", ")) %>% 
                        as.integer()),
                    by = participant_code]
    
    display[, displayed_sequence := 1:.N, by = participant_code]
    
    # Create Flow (Scroll Sequence DT)
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
    
    
    
    # Create Dwell Time DT
    viewport <- data[nchar(viewport_data) > 1,
                     fromJSON(str_replace_all(string = viewport_data,
                                              pattern = '""',
                                              replacement = '"')),
                     by = participant_code][!is.na(doc_id)]
    
    # -- sum durations by tweet (in case someone scrolled back and forth)
    viewport <- viewport[, 
                         .(seconds_in_viewport = sum(duration, 
                                                     na.rm = TRUE)),
                         by = c('participant_code', 'doc_id')]
    
    
    # -- rename
    setnames(x = viewport,
             old = 'doc_id',
             new = 'tweet')
    
    
    # Create Reactions DT
    likes <- data[nchar(likes_data) > 1,
                  fromJSON(str_replace_all(string = likes_data,
                                           pattern = '""',
                                           replacement = '"')),
                  by = participant_code][!is.na(doc_id)]
    
    if(data[nchar(replies_data) > 3, .N] > 0){
      replies <- data[nchar(replies_data) > 3,
                      fromJSON(str_replace_all(string = replies_data,
                                               pattern = '""',
                                               replacement = '"')),
                      by = participant_code][!is.na(doc_id)]
      reactions <- merge(likes, replies, by = c("participant_code", "doc_id"), all = TRUE)

    } else {
      reactions <- likes
      reactions[, replies := NA]

    }
    
    # make sure doc_id is numeric as is the case for the other data.tables
    reactions[, doc_id := as.numeric(doc_id)]
    
    # rename
    setnames(x = reactions,
             old = 'doc_id',
             new = 'tweet')
    
    
    # Merge to Final DT
    merge_1 <- merge(data[, .(participant_code, participant_label, condition)], display, by = c("participant_code"), all = TRUE)
    merge_2 <- merge(merge_1, viewport, by = c("participant_code", "tweet"), all = TRUE)
    merge_3 <- merge(merge_2, flow_collapsed, by = c("participant_code", "tweet"), all = TRUE)
    tmp     <- merge(merge_3, reactions, by = c("participant_code", "tweet"), all = TRUE)
    
    # Reorder columns
    new_order <- c(1, 3, 4)
    remaining_cols <- setdiff(1:ncol(tmp), new_order)
    final <- tmp[, c(new_order, remaining_cols), with = FALSE]
    
    
    if(input$disp == "head") {
      return(head(final))
    }
    else {
      return(final)
    }
    
  })
  
  output$downloadData <- downloadHandler(
    filename = function() {
      paste("DICE-processed-", Sys.Date(), ".csv", sep="")
    },
    content = function(file) {
      write.csv(final, file)
    }
  )
  
}

# Create Shiny app ----
shinyApp(ui, server)