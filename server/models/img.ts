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
  reltype?: string;
  relcount: number;
  size: string;
}

// 图片关联对象模型
export interface ImgRel {
  id: number; // 主键
  fileid: number; // 文件 ID
  resid: number; // 资源 ID
  type: string; // 关联类型
  createTime: string; // 创建时间
}
