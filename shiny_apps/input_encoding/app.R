# Pakages -----
library("pacman")
p_load(magrittr, data.table, stringr)


# Define UI for data upload app ----
ui <- fluidPage(
  
  # App title ----
  titlePanel("Encode DICE Input"),
  
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
      
      # Input: Checkbox if file has header ----
      checkboxInput("header", "Header", TRUE),

      # Input: Select separator ----
      radioButtons("sep", "Separator",
                   choices = c(Comma = ",",
                               Semicolon = ";",
                               Tab = "\t"),
                   selected = ","),

      # Input: Select quotes ----
      radioButtons("quote", "Quote",
                   choices = c(None = "",
                               "Double Quote" = '"',
                               "Single Quote" = "'"),
                   selected = '"'),

      # Horizontal line ----
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

# Define server logic to read selected file ----
server <- function(input, output) {
  
  # Initialize reactiveValues to store the data
  values <- reactiveValues(DT = NULL)
  
  observe({
    req(input$file1)
    
    tryCatch({
      # Update DT in reactiveValues
      values$DT <- fread(input$file1$datapath,
                         header = input$header,
                         sep = input$sep,
                         quote = input$quote) %>%
        as.data.table()
    }, error = function(e) {
      stop(safeError(e))
    })
  })
  
  output$contents <- renderTable({
    req(values$DT) # Make sure DT is available
    data <- values$DT
    

    # do something
    
    
    values$DT <- data
    
    if(input$disp == "head") {
      return(head(data))
    } else {
      return(data)
    }
  })
  
  output$downloadData <- downloadHandler(
    filename = function() {
      paste("DICE-input-", Sys.Date(), ".csv", sep="")
    },
    content = function(file) {
      write.table(values$DT, 
                  file = file, 
                  fileEncoding = "UTF-8", 
                  sep = ";", 
                  row.names = FALSE, 
                  quote = TRUE,
                  na = "")
    }
  )
  
}


# Create Shiny app ----
shinyApp(ui, server)