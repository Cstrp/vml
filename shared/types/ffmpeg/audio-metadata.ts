export interface AudioMetadata {
  format: {
    filename: string;
    nb_streams: number;
    nb_programs: number;
    format_name: string;
    format_long_name: string;
    start_time: number;
    duration: number;
    size: number;
    bit_rate: number;
    probe_score: number;
  };
  streams: Array<{
    index: number;
    codec_name: string;
    codec_long_name: string;
    codec_type: string;
    codec_time_base: string;
    codec_tag_string: string;
    codec_tag: string;
    sample_fmt: string;
    sample_rate: number;
    channels: number;
    channel_layout: string;
    bits_per_sample: number;
    r_frame_rate: string;
    avg_frame_rate: string;
    time_base: string;
    start_pts: number;
    start_time: number;
    duration_ts: number;
    duration: number;
    bit_rate: number;
    max_bit_rate: number;
    bits_per_raw_sample: number;
    nb_frames: number;
    disposition: Record<string, number>;
    tags: Record<string, string>;
  }>;
}
