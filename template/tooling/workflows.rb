require 'fileutils'
require 'pp'

def import_workflows(core_path, core_sdk)
  space_re = /workflows\/(.+)\/.+\.json/
  kapp_re = /kapps\/([a-z0-9\-]+)\/workflows\/(.+)\/.+\.json/
  form_re = /kapps\/([a-z0-9\-]+)\/forms\/workflows\/([a-z0-9\-]+)\/(.+)\/.+\.json/

  # import space workflows
  Dir["#{core_path}/space/workflows/**/*.json"].each do |filename|
    if filename.match?(space_re)
      event = decode_event(filename.match(space_re)[1])
      payload = workflow_payload(filename, event)
      res = core_sdk.add_space_workflow(payload)
    end
  end

  # import kapp / form workflows
  Dir["#{core_path}/space/kapps/**/workflows/**/*.json"].each do |filename|
    if filename.match?(kapp_re)
      kapp_slug = filename.match(kapp_re)[1]
      event = decode_event(filename.match(kapp_re)[2])
      payload = workflow_payload(filename, event)
      res = core_sdk.add_kapp_workflow(kapp_slug, payload)
    elsif filename.match?(form_re)
      kapp_slug = filename.match(form_re)[1]
      form_slug = filename.match(form_re)[2]
      event = decode_event(filename.match(form_re)[3])
      payload = workflow_payload(filename, event)
      res = core_sdk.add_form_workflow(kapp_slug, form_slug, payload)
    end
  end
end

def workflow_payload(filename, event)
  tree = JSON.parse(File.read(filename))
  name = tree["name"]

  {
    "event" => event,
    "name" => name,
    "treeJson" => tree
  }
end

def decode_event(evt)
  evt.split(".").map{ |s| s.capitalize }.join(" ")
end


def encode_event(evt)
  evt.split(" ").map{ |s| s.downcase }.join(".")
end
