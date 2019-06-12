class UserController < ApplicationController

	before_action :authorize_user, :except => [ :login, :auth ]

	# user clicked Spotify login on home page to fire this method
	def login
		url = "https://accounts.spotify.com/authorize"
		query_params = {
			client_id: Rails.application.secrets.SPECTRIFY_CLIENT_ID,
			response_type: "code",
			redirect_uri: Rails.application.secrets.SPECTRIFY_REDIRECT_URI,
			# for some messed up reason, to read the playback state without and errors,
			# I need to require acces to a user's private info and their birthdate..? wtf spotify...
			# all I want is the email
			scope: "user-read-email user-read-currently-playing user-read-playback-state user-modify-playback-state",
			show_dialog: true
		}
		# redirects user's browser to Spotify's authorisation page
		# the page details the scopes Spectrify is requesting
		redirect_to "#{ url }?#{ query_params.to_query }"
	end

	# handles /auth/v1 response from Spotify
	# either errors or succeeds, with response data returned
	def auth
		if params[ :error ]
			puts "LOGIN ERROR", params
			redirect_to login_error_path
		else
			# get authorization code from URL
			code = params[ :code ]
			spotify_authorisation_response =
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
			user_access_token = spotify_authorisation_response["access_token"]

			# fetch spotify user info, with the access_token from spotify_authorisation_response
			spotify_user_info_response =
				HTTParty.get(
					"https://api.spotify.com/v1/me",
					headers: {
						Accept: "application/json",
						Authorization: "Bearer #{ user_access_token }"
					}
				)

			# create user based on response, or find the exisiting user in db by email
			user =
				User.find_or_create_by(
					:email => spotify_user_info_response["email"],
				)
			session[ :user_id ] = user.id

			# update token if it is over 55 mins old
			user.update(
				:access_token => spotify_authorisation_response["access_token"],
				:refresh_token => spotify_authorisation_response["refresh_token"]
			)

			# if all successfull, redirect to player page - ready to stream
			redirect_to player_path
		end
	end

	def player
		# check to see if access token has expired
		if @current_user.access_token_expired?
			puts "\n\n**********\nTIME UPDATE THING WORKING\n**********\n\n"
			# if it has, request a new one with refresh token
			spotify_refresh_token_response =
				HTTParty.post(
					"https://accounts.spotify.com/api/token",
					headers: {
						Accept: "application/json",
					},
					body: {
						grant_type: "refresh_token",
						refresh_token: @current_user.refresh_token,
						client_id: Rails.application.secrets.SPECTRIFY_CLIENT_ID,
						client_secret: Rails.application.secrets.SPECTRIFY_CLIENT_SECRET,
					}
				)
			@current_user.update( :access_token => spotify_refresh_token_response[ "access_token" ] )
		end
	end

	def login_error
	end

	def logout
		session[ :user_id ] = nil
		redirect_to root_path
	end

end