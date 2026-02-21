## Creating your bots

1. Follow [this guide](https://discordjs.guide/legacy/preparations/app-setup) to set up your discord bot. Make a note of the token, you'll need it in a minute.
2. Set up your bot on Fluxer by going to User Settings > Applications and follow the instructions there. Again, make note of your token. Don't get them mixed up!
3. Use the OAuth builders to invite your bots to their respective servers. Both bots require the Manage Roles, Manage Webhooks, Send Messages, and Read Message History permissions.

## Installation with Docker (RECOMMENDED)

### Setup
1. Follow the steps on [the Docker website](https://www.docker.com/) to install Docker Desktop.
2. Create a folder for the bot to store the information about your bridges. Note the path to this file, you'll need it in a moment.
3. Download the provided docker-compose.example.yml, and place it somewhere you'll remember it. Rename it to docker-compose.yml.
4. In your docker-compose.yml, fill in the tokens for your Fluxer and Discord bots, as well as the path to the database folder you just created.
   Change the CMD_PREFIX setting if you'd like to use something other than the default.
5. Note the path to your docker-compose.yml, since it's required to run the bot.

### Testing
To start your bot, open your command line and run `docker compose -f {PATH_TO_YOUR_DOCKER_COMPOSE} up -d`.  
To stop it, run `docker compose -f {PATH_TO_YOUR_DOCKER_COMPOSE} down`.  
Check that your bot is working by typing `brdg;help` (or use your custom prefix if you set one).  

## Installation with Source Code
TBA
