class CreateUsers < ActiveRecord::Migration[5.2]
	def change
		create_table :users do |t|
			t.string :country
			t.text :display_name
			t.text :email
			t.text :external_url
			t.text :api_url
			t.integer :followers
			t.text :image_url
			t.string :product
			t.string :type
			t.text :uri

			t.text :access_token
			t.text :refresh_token

			t.timestamps
		end
	end
end
