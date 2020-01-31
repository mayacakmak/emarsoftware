import requests
import time
import json

# Dummy data to represent the statius of the neck application
current_neck_pan = 0
current_neck_tilt = 0
tactile_data = {'sensor0':1, 'sensor1':1, 'sensor2':1};

# Dummy data for LED
current_led_rgb = [255,255,255]

# Robot and database info
this_robot_id = 0
URL = "https://emar-database.firebaseio.com/"
AUTH_URL = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAisnI9BEW_Uc0-z1ad25nB6eNXEEQ_xQQ";
headers = {'Content-type': 'application/json'}
auth_params = {"returnSecureToken":"true"}

# Start connection to Firebase and get anonymous authentication
connection = requests.Session()
connection.headers.update(headers)
auth_request = connection.post(url=AUTH_URL, params=auth_params)
auth_info = auth_request.json()
auth_params = {'auth': auth_info["idToken"]}

#print(auth_info)

while(True):

	# Sending get request and obtaining the response
	get_request = connection.get(url = URL + "robots.json")
	# Extracting data in json format 
	robots = get_request.json()
	
	##############
	# Check if there is a new neck value requested through database
	# and if yes, move the neck there
	##############
	neck_action = robots[this_robot_id]["actions"]["neck"]

	if (current_neck_pan != neck_action["panAngle"]):
		print("New neck pan value: " + str(neck_action["panAngle"]))
		# TODO: Set actual neck value
		current_neck_pan = neck_action["panAngle"]

	if (current_neck_tilt != neck_action["tiltAngle"]):
		print("New neck tilt value: " + str(neck_action["tiltAngle"]))
		# TODO: Set actual neck value
		current_neck_tilt = neck_action["tiltAngle"]

	##############
	# Send the most recent values of tactile sensors
	##############

	# TODO: Update tactile_data based on the real tactile sensors
	tactile_data_json =  json.dumps(tactile_data)
	tactile_url = URL + "robots/" + str(this_robot_id) + "/inputs/tactile.json"
	post_request = connection.put(url=tactile_url,
		data=tactile_data_json, params=auth_params)
	print("Tactile sensor data sent: " + str(post_request.ok))

	##############
	# Check if there is a new LED value in the database
	##############
	robot_state = robots[this_robot_id]["state"]
	led_rgb = [robot_state["currentLEDR"], robot_state["currentLEDG"], robot_state["currentLEDB"]]
	if (current_led_rgb != led_rgb):
		print("New LED color: " str(led_rgb))
		# TODO: Set actual LED color
		current_led_rgb = led_rgb
	
	time.sleep(0.1)


#########========

