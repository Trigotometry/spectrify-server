# == Schema Information
#
# Table name: users
#
#  id            :bigint(8)        not null, primary key
#  birthdate     :date
#  country       :string
#  display_name  :text
#  email         :text
#  external_url  :text
#  api_url       :text
#  followers     :integer
#  image_url     :text
#  product       :string
#  type          :string
#  uri           :text
#  access_token  :text
#  refresh_token :text
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#

class User < ApplicationRecord
	
	validates :email, :uniqueness => true, :presence => true

	def access_token_expired?
		puts "\n\n**********\nTIME CHECK METHOD FROM MODEL FIRED\n**********\n\n"
		# return true if access_token is older than 55 mins, based on updated_at
		( Time.now - self.updated_at ) > 3300
	end

end
