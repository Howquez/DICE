from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

# Constants for API calls
SERVER_URL = 'https://ibt-hsg.herokuapp.com'
REST_KEY = ''  # fill this with your actual REST key

@app.route('/')
def index():
    # This route serves the index.html template
    return render_template('index.html')

# Helper function to call the external API
def call_api(method, *path_parts, **params):
    path_parts = '/'.join(str(part) for part in path_parts)
    url = f'{SERVER_URL}/api/{path_parts}/'
    headers = {'otree-rest-key': REST_KEY}
    resp = method(url, json=params, headers=headers)
    if not resp.ok:
        msg = (
            f'Request to "{url}" failed '
            f'with status code {resp.status_code}: {resp.text}'
        )
        raise Exception(msg)
    return resp.json()

@app.route('/create_session', methods=['POST'])
def create_session():
    # This route handles the API call based on form data
    data = request.json

    url_param = 'None'
    if data.get('recruitment_platform') == 'Prolific':
        url_param = 'PROLIFIC_PID'

    try:
        response = call_api(
            requests.post,
            'sessions',
            session_config_name='oTweet',
            num_participants=data.get('participant_number'),
            modified_session_config_fields=dict(
                title=data.get('title'),
                full_name=data.get('full_name'),
                eMail=data.get('eMail'),
                data_path=data.get('content_url'),
                topics=not data.get('display_skyscraper'),
                url_param=url_param,
                survey_link=data.get('survey_url'),
                search_term=data.get('search_term'),
                sort_by=data.get('sort_by'),
                condition_col=data.get('condition_col'),
                briefing=data.get('briefing')
            )
        )
        # print(response)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/submit_completion_code', methods=['POST'])
def submit_completion_code():
    data = request.json
    print("Received data:", data)  # Print the received data

    completion_code = data.get('completion_code')
    session_code = data.get('session_code')

    try:
        # Use the call_api function to process the completion_code and session_code
        api_response = call_api(
            requests.post,
            'session_vars',
            session_code,
            vars=dict(completion_code=completion_code)
        )

        # Construct the response
        response = {
            "status": "success",
            "api_response": api_response,  # The response from the external API
            "completion_code": completion_code,
            "session_code": session_code
        }
        print("Response data:", response)  # Print the response data

        return jsonify(response)
    except Exception as e:
        error_response = {"error": str(e)}
        print("Error response:", error_response)  # Print the error response

        return jsonify(error_response), 500



if __name__ == '__main__':
    app.run(debug=True)
