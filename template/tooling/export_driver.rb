require 'json'

env_errors = []
env_errors << "Set the EXPORT_DOMAIN environment variable to export from" if ENV["EXPORT_DOMAIN"].nil?
env_errors << "Set the EXPORT_SPACE_SLUG environment variable to export from" if ENV["EXPORT_SPACE_SLUG"].nil?
env_errors << "Set the EXPORT_SPACE_ADMIN_USERNAME environment variable for the space to export from" if ENV["EXPORT_SPACE_ADMIN_USERNAME"].nil?
env_errors << "Set the EXPORT_SPACE_ADMIN_PASSWORD environment variable for the space to export from" if ENV["EXPORT_SPACE_ADMIN_PASSWORD"].nil?

unless env_errors.empty?
  raise "Missing environment variables: \n\t#{env_errors.join("\n\t")}"
end

domain = ENV["EXPORT_DOMAIN"]
space_slug = ENV["EXPORT_SPACE_SLUG"]
space_username = ENV["EXPORT_SPACE_ADMIN_USERNAME"]
space_password = ENV["EXPORT_SPACE_ADMIN_PASSWORD"].gsub("$", "\$").gsub("`", "\`").gsub("\"", "\\\"").gsub("\\", "\\\\").gsub("!", "\!").gsub("~", "\~")

export_server = "https://#{space_slug}.#{domain}"

export_options = {
  "core" => {
    "api" => "#{export_server}/app/api/v1",
    "agent_api" => "#{export_server}/app/components/agents/system/app/api/v1",
    "proxy_url" => "#{export_server}/app/components",
    "server" => export_server,
    "space_slug" => space_slug,
    "space_name" => "Momentum",
    "service_user_username" => space_username,
    "service_user_password" => space_password,
    "task_api_v1" => "#{export_server}/app/components/task/app/api/v1",
    "task_api_v2" => "#{export_server}/app/components/task/app/api/v2"
  },
  "http_options" => {
    "log_level" => "info",
    "log_output" => "stdout"
  }
}


export_file = File.join(File.dirname(__FILE__), "export.rb")
system("ruby", export_file, export_options.to_json)
