export enum OpenverseRequestParams {
  page = "page", // The page number to retrieve | INTEGER
  page_size = "page_size", // The number of results per page | INTEGER
  q = "q", // The search query | STRING
  source = "source", // The source of the content | STRING
  excluded_source = "excluded_source", // The source to exclude from results | STRING
  tags = "tags", // The tags to filter by | STRING
  title = "title", // The title to filter by | STRING
  creator = "creator", // The creator to filter by | STRING
  unstable__collection = "unstable__collection", // The collection to filter by | STRING
  unstable__tag = "unstable__tag", // The tag to filter by | STRING
  license = "license", // The license to filter by | STRING
  license_type = "license_type", // The type of license to filter by | STRING
  filter_dead = "filter_dead", // Whether to filter out dead links | BOOLEAN
  extension = "extension", // The file extension to filter by | STRING
  mature = "mature", // Whether to include mature content | BOOLEAN
  unstable__sort_by = "unstable__sort_by", // The field to sort by | STRING
  unstable__sort_dir = "unstable__sort_dir", // The direction to sort (asc or desc) | STRING
  unstable__authority = "unstable__authority", // The authority to filter by | BOOLEAN
  unstable__authority_boost = "unstable__authority_boost", // Whether to boost results from authoritative sources | number <double> 
  unstable__include_sensitive_results = "unstable__include_sensitive_results", // Whether to include sensitive results | boolean
  category = "category", // The category to filter by | STRING
  length = "length", // The length to filter by | STRING
  peaks = "peaks", // The peaks to filter by | BOOLEAN
}
