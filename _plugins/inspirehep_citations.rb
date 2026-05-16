require "json"
require "net/http"
require "uri"

module Jekyll
  class InspireHEPCitationsTag < Liquid::Tag
    Citations = {}

    def initialize(tag_name, params, tokens)
      super
      @recid = params.strip
    end

    def render(context)
      recid = context[@recid.strip]
      return "N/A" if recid.nil? || recid.empty?

      return Citations[recid] if Citations[recid]

      api_url = "https://inspirehep.net/api/literature/?fields=citation_count&q=recid:#{recid}"

      begin
        response = Net::HTTP.get(URI(api_url))
        data = JSON.parse(response)
        citation_count = data.fetch("hits").fetch("hits").first.fetch("metadata").fetch("citation_count").to_i
        citation_count = format_count(citation_count)
      rescue StandardError => e
        citation_count = "N/A"
        Jekyll.logger.warn "InspireHEP:", "Error fetching citation count for #{recid}: #{e.class} - #{e.message}"
      end

      Citations[recid] = citation_count
      citation_count
    end

    private

    def format_count(count)
      return count.to_s if count < 1_000
      return "#{(count / 1_000.0).round(1)}K" if count < 1_000_000

      "#{(count / 1_000_000.0).round(1)}M"
    end
  end
end

Liquid::Template.register_tag("inspirehep_citations", Jekyll::InspireHEPCitationsTag)
