Rails.application.routes.draw do

	get "/" => "home#index"
	get "/login/failure" => "user#failure", :as => "login_failure"
	get "/login" => "user#login"
	get "/callback" => "user#access"
	get "/success" => "user#success"

end
