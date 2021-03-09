import requests
import time
import json

# Initialization

# Dummy data for motors
# Currently stored as an array corresponding to [motor 1, motor 2]
motor_values = []

# Robot from database to listen to
this_robot_id = 0
# Firebase database parameters
api_key = ""
URL = "https://emar-database.firebaseio.com/"
AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=" + api_key;
headers = {'Content-type': 'application/json'}
auth_req_params = {"returnSecureToken":"true"}

# Start connection to Firebase and get anonymous authentication
connection = requests.Session()
connection.headers.update(headers)
auth_request = connection.post(url=AUTH_URL, params=auth_req_params)
auth_info = auth_request.json()
auth_params = {'auth': auth_info["idToken"]}

# Main loop

while(True):

	# Sending get request and obtaining the response
	get_request = connection.get(url = URL + "robots.json")
	# Extracting data in json format 
	robots = get_request.json()
	
	##############
	# Check if there is a new motor value in the database
	##############
	robot_state = robots[this_robot_id]["state"]
	new_motor_values = robot_state["motors"]
	if (motor_values != new_motor_values):
		print("New motor values: " + str(new_motor_values))
		# TODO: Do something with the new motor values
		motor_values = new_motor_values
	
	time.sleep(0.1)
