export interface FileItem {
  name: string;
  path: string;
  type: string; // 'file' or 'dir'
  size: number;
  download_url: string;
}
