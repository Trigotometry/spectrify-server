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
	validates :email, :uniqueness => true
end
