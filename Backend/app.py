from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit
from flask_cors import CORS  # Import CORS
from pymongo.errors import PyMongoError
from db_config import get_db  # Import get_db from db_config
from datetime import datetime
import pytz  # Import pytz for timezone handling

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)  

# Allow all origins for SocketIO
socketio = SocketIO(app, cors_allowed_origins="*")  

@app.route('/api/data', methods=['GET'])
def get_data():
    try:
        collection = get_db()['user_retention_data']
        data = list(collection.find({}))  # Fetch all documents from the collection
        for document in data:
            document['_id'] = str(document['_id'])  # Convert ObjectId to string for JSON serialization
        return jsonify(data), 200
    except PyMongoError as e:
        return jsonify({"error": "Failed to fetch data from database", "details": str(e)}), 500

@app.route('/api/data', methods=['POST'])

def receive_data():
    if request.is_json:
        
        data = request.get_json()
        print("Received Data:", data)

        # Extract values from JSON
        device_id = data.get("device_id")
        rssi_values = data.get("rssi_values")
        user_retention = rssi_values[len(rssi_values) // 2]
        in_time_epoch = data.get("in_time")
        out_time_epoch = data.get("out_time")
        avg_distance = data.get("average_distance")

        # Convert epoch timestamps to IST
        ist_timezone = pytz.timezone('Asia/Kolkata')
        
        in_time_ist = datetime.fromtimestamp(in_time_epoch, ist_timezone) if in_time_epoch else None
        out_time_ist = datetime.fromtimestamp(out_time_epoch, ist_timezone) if out_time_epoch else None

        # Prepare document for MongoDB
        document = {
            "booth_id":1,
            "device_id": device_id,
            "rssi_values": rssi_values,
            "user_retention": user_retention,
            "in_time": in_time_ist.isoformat() if in_time_ist else None,
            "out_time": out_time_ist.isoformat() if out_time_ist else None,
            "average_distance": avg_distance,
            "timestamp": datetime.now(ist_timezone).isoformat()  # Current time in IST
        }

        print(document)

        try:
            # Use get_db to access MongoDB and insert the document
            collection = get_db()['user_retention_data']
            result = collection.insert_one(document)
            print("Data successfully inserted with ID:", result.inserted_id)

            # Emit an event to notify the frontend
            socketio.emit('data_updated')  # Notify the frontend that data has been updated

            return jsonify({"response": "Data received and stored successfully", "inserted_id": str(result.inserted_id)}), 200

        except PyMongoError as e:
            # Handle MongoDB errors and return a JSON response
            print(f"Error during MongoDB insertion: {e}")
            return jsonify({"error": "Failed to insert data into database", "details": str(e)}), 500
    
    else:
        # Return error if the request is not JSON
        return jsonify({"error": "Request must be JSON"}), 400

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000)
