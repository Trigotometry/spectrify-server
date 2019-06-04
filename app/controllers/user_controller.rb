class UserController < ApplicationController

	# user clicked Spotify login on home page to fire this method
	def login
		url = "https://accounts.spotify.com/authorize"
		query_params = {
			client_id: Rails.application.secrets.SPECTRIFY_CLIENT_ID,
			response_type: "code",
			redirect_uri: Rails.application.secrets.SPECTRIFY_REDIRECT_URI,
			scope: "user-read-currently-playing",
			show_dialog: false
		}
		# redirects user's browser to Spotify's authorisation page
		# the page details the scopes Spectrify is requesting
		redirect_to "#{ url }?#{ query_params.to_query }"
	end

	# handles /callback response from Spotify
	# either errors or succeeds and response data delivered
	def access
		if params[ :error ]
			puts "LOGIN ERROR", params
			redirect_to login_failure_path
		else
			@code = params[ :code ]
			@spotify_request =
				HTTParty.post(
					'https://accounts.spotify.com/api/token',
					# headers: { accept: 'application/json' },
					headers: {
						Accept: 'application/json'
					},
					body: {
						grant_type: "authorization_code",
						code: @code,
						client_id: Rails.application.secrets.SPECTRIFY_CLIENT_ID,
						client_secret: Rails.application.secrets.SPECTRIFY_CLIENT_SECRET,
						redirect_uri: Rails.application.secrets.SPECTRIFY_REDIRECT_URI
					}
				)
			@access_token = @spotify_request['access_token']
			# @refresh_token = @spotify_request['refresh_token']
			@user =
			# NEED TO ASK WHY QUERY IS BAD vs HEADERS
				# HTTParty.get(
				# 	'https://api.spotify.com/v1/me',
				# 	query: {
				# 		access_token: @access_token
				# 	}
				# )
				HTTParty.get(
					"https://api.spotify.com/v1/me",
					headers: {
						Accept: "application/json",
						Authorization: "Bearer #{ @access_token }"
					}
				)

			@current_song =
				HTTParty.get(
					"https://api.spotify.com/v1/me/player",
					headers: {
						Accept: "application/json",
						Authorization: "Bearer #{ @access_token }"
					}
				)

			puts "\n**********\nUSER\n**********\n#{@user.body}\n**********"
			puts "\n**********\nCURRENT SONG\n**********\n#{@user.body}\n**********"
			# redirect_to success_path
		end

	end

	def success
	end

	def failure
	end

end