import random
import datetime
import pytz
from pymongo import MongoClient
from db_config import get_db  # Import get_db from db_config

# Use your existing collection
collection = get_db()['user_retention_data']

def generate_synthetic_data():
    ist = pytz.timezone('Asia/Kolkata')
    
    # Generate a random device ID (MAC address format)
    device_id = ":".join(["{:02x}".format(random.randint(0, 255)) for _ in range(6)])
    
    # Generate random RSSI values (4 to 10 samples)
    rssi_values = [random.randint(-80, -20) for _ in range(random.randint(4, 10))]
    
    # Select middle value for user_retention
    user_retention = rssi_values[len(rssi_values) // 2]
    
    # Generate random in_time and out_time within 10 AM to 4 PM
    now = datetime.datetime.now(ist).date()  # Get current date
    start_time = datetime.datetime.combine(now, datetime.time(10, 0), ist)  # 10 AM
    end_time = datetime.datetime.combine(now, datetime.time(16, 0), ist)  # 4 PM

    in_time = start_time + datetime.timedelta(seconds=random.randint(0, (end_time - start_time).seconds - 300))
    out_time = in_time + datetime.timedelta(seconds=random.randint(30, 300))  # 30 sec to 5 min later

    # Calculate average distance (random between 0.5m and 5m)
    average_distance = round(random.uniform(0.5, 5.0), 2)

    # Assign a random booth ID (1 to 5)
    booth_id = random.randint(1, 5)

    # Construct the final data structure
    synthetic_data = {
        "device_id": device_id,
        "rssi_values": rssi_values,
        "user_retention": user_retention,
        "in_time": in_time.isoformat(),
        "out_time": out_time.isoformat(),
        "average_distance": average_distance,
        "timestamp": out_time.isoformat(),  # Same as out_time
        "booth_id": booth_id
    }

    return synthetic_data

# Generate bulk synthetic data and insert into MongoDB
def generate_and_store_bulk_data(num_entries=100):
    data_list = [generate_synthetic_data() for _ in range(num_entries)]
    
    # Insert into MongoDB
    collection.insert_many(data_list)
    
    print(f"✅ {num_entries} synthetic customer entries generated and inserted into MongoDB.")

# Run bulk data generation and store in MongoDB
generate_and_store_bulk_data(365)  # Generate 100 entries
