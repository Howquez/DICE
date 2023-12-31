
var globalSessionCode;

// This function is called when the server sends back a response
function liveRecv(data) {
    console.log('receiving');

    // Store the session code from the response
    globalSessionCode = data.code;

    var alertDiv = document.getElementById('alertPlaceholder');
    let recruitment_platform = document.getElementById('recruitment_platform').value;

    // Update class and role of the div
    alertDiv.className = 'alert alert-primary mt-4 mb-5 shadow';
    alertDiv.setAttribute('role', 'alert');

    // Clear existing content
    alertDiv.innerHTML = '';

    var title = document.createElement('h4');
    title.textContent = 'Session ';

    // Create a code element for data.code
    var codeElement = document.createElement('code');
    codeElement.textContent = data.code;

    // Append the code element to the title
    title.appendChild(codeElement);

    title.append(' created successfully!');

    // Create a paragraph element for the text
    var paragraph_1 = document.createElement('p');
    paragraph_1.textContent = 'You can visit your session: ';

    // Create a paragraph element for the text
    var paragraph_2 = document.createElement('p');
    paragraph_2.textContent = "Please write the session code (" + data.code + ") or the URL down. You will need them to download your data, eventually.";

    // Create an anchor (a) element for the hyperlink
    var link = document.createElement('a');
    link.href = data.admin_url;
    link.textContent = data.admin_url;
    link.setAttribute('target', '_blank'); // Open in new tab

    // Append the title, link and paragraphs to the div
    alertDiv.appendChild(title);
    alertDiv.appendChild(paragraph_1);
    paragraph_1.appendChild(link);
    alertDiv.appendChild(paragraph_2);

    // Display the modified session-wide URL only if 'Prolific' was selected
    if (recruitment_platform === 'Prolific' && data.session_wide_url) {
        var modifiedSessionWideUrl = data.session_wide_url +
                                     '/?participant_label={{%PROLIFIC_PID%}}' +
                                     '&prolific_study_id={{%STUDY_ID%}}' +
                                     '&prolific_session_id={{%SESSION_ID%}}';

        // Explanatory text
        var explanatoryText = document.createElement('p');
        explanatoryText.textContent = 'Copy the following URL and provide it to Prolific:';

        // Create a Bootstrap input group
        var inputGroup = document.createElement('div');
        inputGroup.className = 'input-group mb-3';

        // Create a readonly input to display the URL
        var urlInput = document.createElement('input');
        urlInput.setAttribute('type', 'text');
        urlInput.className = 'form-control';
        urlInput.setAttribute('value', modifiedSessionWideUrl);
        urlInput.setAttribute('readonly', true);
        urlInput.setAttribute('aria-label', 'Modified URL');
        urlInput.setAttribute('aria-describedby', 'button-addon');

        // Create a button for copying the URL
        var copyButton = document.createElement('button');
        copyButton.className = 'btn btn-outline-primary';
        copyButton.setAttribute('type', 'button');
        copyButton.setAttribute('id', 'button-addon');
        copyButton.textContent = 'Copy URL';
        copyButton.onclick = function() {
            urlInput.select();
            document.execCommand('copy');
        };

        // Append the input and button to the input group
        inputGroup.appendChild(urlInput);
        inputGroup.appendChild(copyButton);

        // Append the explanatory text and input group to the alert div
        var alertDiv = document.getElementById('alertPlaceholder');
        alertDiv.appendChild(explanatoryText);
        alertDiv.appendChild(inputGroup);
    }

    // Store the session code
    var sessionCode = data.code;

    // Check if Prolific was the chosen platform and display additional input
    if (recruitment_platform === 'Prolific') {
        // Show the completion code section
        document.getElementById('completionCodeSection').style.display = 'block';
    }
}

// This function is called when the "Create Session" button is clicked
function sendValue() {
    console.log('sent');

    let title = document.getElementById('title').value;
    let full_name = document.getElementById('name').value;
    let eMail = document.getElementById('eMail').value;
    let participant_number = document.getElementById('participant_number').value;
    let content_url = document.getElementById('content_url').value;
    let recruitment_platform = document.getElementById('recruitment_platform').value;
    let survey_url = document.getElementById('survey_url').value;
    let search_term = document.getElementById('search_term').value;
    let sort_by = document.getElementById('sort_by').value;
    let condition_col = document.getElementById('condition_col').value;
    let display_skyscraper = document.getElementById('display_skyscraper').checked;
    let html_briefing = document.getElementById('html_briefing').value;

    fetch('/create_session', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            full_name: full_name,
            eMail: eMail,
            participant_number: parseInt(participant_number),
            content_url: content_url,
            recruitment_platform: recruitment_platform,
            survey_url: survey_url,
            search_term: search_term,
            sort_by: sort_by,
            condition_col: condition_col,
            display_skyscraper: display_skyscraper,
            briefing: html_briefing
        }),
    })
    .then(response => response.json())
    .then(data => {
        liveRecv(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function submitCompletionCode() {
    var completionCode = document.getElementById('completionCode').value;
    var completionAlertDiv = document.getElementById('completionAlertPlaceholder');

    fetch('/submit_completion_code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            completion_code: completionCode,
            session_code: globalSessionCode // Include the stored session_code
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Display success message
        completionAlertDiv.innerHTML = '';
        completionAlertDiv.className = 'alert alert-success my-4';
        completionAlertDiv.textContent = 'Everything is set up now!';
    })
    .catch((error) => {
        // Display error message
        completionAlertDiv.innerHTML = '';
        completionAlertDiv.className = 'alert alert-danger my-4';
        completionAlertDiv.textContent = 'Error occurred: ' + error;
    });
}


// This event listener is used to show/hide the skyscraper ad configuration
document.addEventListener('DOMContentLoaded', function () {
    var checkBox = document.getElementById('display_skyscraper');
    var adCard = document.getElementById('adCard');

    checkBox.addEventListener('change', function () {
        if (this.checked) {
            adCard.style.display = 'block';
        } else {
            adCard.style.display = 'none';
        }
    });
});
