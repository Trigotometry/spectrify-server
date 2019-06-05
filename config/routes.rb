Rails.application.routes.draw do

	root :to => "home#index"
	get "/login/failure" => "user#failure"
	get "/login" => "user#login"
	get "/logout" => "user#logout"
	get "/callback" => "user#access"
	get "/success" => "user#success"

end
