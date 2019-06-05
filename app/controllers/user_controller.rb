class UserController < ApplicationController

	before_action :authorize_user, :except => [ :login, :access ]

	# user clicked Spotify login on home page to fire this method
	def login
		url = "https://accounts.spotify.com/authorize"
		query_params = {
			client_id: Rails.application.secrets.SPECTRIFY_CLIENT_ID,
			response_type: "code",
			redirect_uri: Rails.application.secrets.SPECTRIFY_REDIRECT_URI,
			scope: "user-read-private user-read-email user-read-currently-playing user-read-playback-state streaming user-read-birthdate",
			show_dialog: true
		}
		# redirects user's browser to Spotify's authorisation page
		# the page details the scopes Spectrify is requesting
		redirect_to "#{ url }?#{ query_params.to_query }"
	end

	# handles /callback response from Spotify
	# either errors or succeeds, with response data returned
	def access
		if params[ :error ]
			puts "LOGIN ERROR", params
			redirect_to login_failure_path
		else
			# get authorization code from URL
			code = params[ :code ]
			spotify_request =
				HTTParty.post(
					"https://accounts.spotify.com/api/token",
					headers: {
						Accept: "application/json",
					},
					body: {
						grant_type: "authorization_code",
						code: code,
						client_id: Rails.application.secrets.SPECTRIFY_CLIENT_ID,
						client_secret: Rails.application.secrets.SPECTRIFY_CLIENT_SECRET,
						redirect_uri: Rails.application.secrets.SPECTRIFY_REDIRECT_URI
					}
				)
			# setup a new user with barebones data
			db_user = User.new
			# save response tokens as temps on a new user into DB for later calls
			db_user.access_token = spotify_request["access_token"]
			db_user.refresh_token = spotify_request["refresh_token"]

			# fetch spotify user info
			spotify_user =
				HTTParty.get(
					"https://api.spotify.com/v1/me",
					headers: {
						Accept: "application/json",
						# Content-Type: "application/json",
						Authorization: "Bearer #{ db_user.access_token }"
					}
				)

			# try and find the user in the database, to see if exists already
			user = User.find_by :email => spotify_user["email"]
			if user.present?
				# if user doesn't return null, then set the session id to their already-in-database id
				user.access_token = spotify_request["access_token"]
				user.save
				session[ :user_id ] = user.id
				redirect_to success_path
			else
				# otherwise, save the db_user's details, and set the session id to the new db_user's id
				db_user.email = spotify_user["email"]
				db_user.display_name = spotify_user["display_name"] unless spotify_user["display_name"].nil?
				session[ :user_id ] = db_user.id
				redirect_to success_path
			end
		end
	end

	def success
		# fetch current streaming song details
		current_song =
			HTTParty.get(
				"https://api.spotify.com/v1/me/player",
				headers: {
					Accept: "application/json",
					Authorization: "Bearer #{ @current_user.access_token }"
				}
			)
		# response_body_json = JSON.parse( current_song.body )
		# @current_song_pretty = JSON.pretty_generate( response_body_json )
	end

	def failure
	end

	def logout
		session[ :user_id ] = nil
		redirect_to root_path
	end

end