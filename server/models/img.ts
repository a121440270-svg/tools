// 图片对象模型
export interface Img {
  id: number;
  name: string;
  path: string;
  type: string;
  relId: number;
  alt?: string;
  createAt: string;
  isDel: boolean;
}
