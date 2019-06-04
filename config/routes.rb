Rails.application.routes.draw do

	root 'home#index'
	get '/artists', to: 'artists#index'
	get '/artists/:id', to: 'artists#show', as: 'artist'

end
