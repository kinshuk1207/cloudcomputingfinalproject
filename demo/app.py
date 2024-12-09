from flask import Flask, jsonify, request, send_from_directory
import pandas as pd

app = Flask(__name__, static_folder='static')

# Load and preprocess data
play_by_play_columns = [
    'game_date', 'inning', 'inning_topbot', 'player_name', 'at_bat_number', 'pitch_number', 'game_pk',
    'events', 'description', 'pitch_type',  # Added pitch_type
    'outs_when_up', 'balls', 'strikes', 'bat_score', 'fld_score'
]


# Load the CSV and preprocess it
data = pd.read_csv('data/play_by_play.csv')
play_by_play = data[play_by_play_columns]  # Restrict to specific columns
play_by_play_sorted = play_by_play.sort_values(
    by=['game_pk','game_date', 'inning', 'inning_topbot', 'outs_when_up', 'at_bat_number', 'pitch_number'],
    ascending=[True, True, True, False, True, True, True]
).reset_index(drop=True)  # Reset index for clean iteration

# Convert to a dictionary for easy use in Flask
data_dict = play_by_play_sorted.to_dict(orient='records')

current_index = 0

def sanitize_row(row):
    """Replace NaN values with None for JSON compatibility."""
    return {key: (None if pd.isna(value) else value) for key, value in row.items()}

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/start', methods=['GET'])
def start():
    """Return the first row of the play-by-play data."""
    global current_index
    current_index = 0
    sanitized_row = sanitize_row(data_dict[current_index])
    return jsonify(sanitized_row)

@app.route('/next', methods=['GET'])
def next_play():
    """Return the next row of the play-by-play data."""
    global current_index
    current_index += 1
    if current_index < len(data_dict):
        sanitized_row = sanitize_row(data_dict[current_index])
        return jsonify(sanitized_row)
    return jsonify({'message': 'End of simulation'})

@app.route('/predict', methods=['POST'])
def predict():
    """Return example predictions."""
    # Example predictions, replace this with actual model predictions
    predictions = ["FF", "CH", "SI"]
    return jsonify(predictions)

@app.route('/resume', methods=['POST'])
def resume():
    """Return the correct pitch type based on current data."""
    global current_index
    correct_pitch = data_dict[current_index+1].get('pitch_type', None)
    return jsonify({'correct_pitch': correct_pitch})

if __name__ == '__main__':
    app.run(debug=True)
