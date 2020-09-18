# This script will automatically install pug on your computer and compile all of the pug files in the project
# NPM does need to be install first though: https://nodejs.org/en/download/

import os

print("Installing PUG")
os.system("npm install pug-cli -g")

print("Compiling files to HTML")
for pug_file in [os.path.join(dp, f) for dp, dn, fn in os.walk(os.path.expanduser(".")) for f in fn]:
    if pug_file.split(".")[-1] == "pug":
        print(pug_file)
        os.system("pug -P "+pug_file)