Rails.application.routes.draw do

	root :to => "home#index"
	get "/login/error" => "user#login_error"
	get "/login" => "user#login"
	get "/auth/v1" => "user#auth"
	get "/player" => "user#player"
	get "/logout" => "user#logout"
	get "*path" => redirect("/player")
	
end
