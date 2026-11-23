// Photo sets. Each image is published in two sizes, made from the original
// by scaling its long edge down to 1280px and 2560px (never up):
//   public/images/<folder>/<name>-1280.jpg and <name>-2560.jpg
// width/height are the original's, for the aspect ratio.

export type Photo = { name: string; width: number; height: number };
export type Gallery = {
  folder: string;
  title: string;
  /** Shown centred in the bottom margin under the single photo. */
  caption?: string;
  photos: Photo[];
};

export const PARIS: Gallery = {
  folder: 'photo',
  title: 'Paris',
  caption: 'Paris • Canon A1 • Canon 35mm f2.8 TS S.S.C. • Raw scans',
  photos: [
    { name: 'IMG_0846', width: 3130, height: 2075 },
    { name: 'IMG_0571', width: 1532, height: 1015 },
    { name: 'IMG_0825', width: 3130, height: 2075 },
    { name: 'IMG_0862', width: 3130, height: 2075 },
    { name: 'IMG_0876', width: 1998, height: 3007 },
    { name: 'IMG_0923', width: 3130, height: 2075 },
    { name: 'IMG_1092', width: 2075, height: 3130 },
    { name: 'IMG_1239', width: 3130, height: 2075 },
    { name: 'IMG_1242', width: 3024, height: 2004 },
    { name: 'IMG_1206', width: 2941, height: 1979 },
    { name: 'IMG_1277', width: 2016, height: 3064 },
    { name: 'IMG_1314', width: 3130, height: 2075 },
    { name: 'IMG_1318', width: 2865, height: 1930 },
    { name: 'IMG_1511', width: 3130, height: 2075 },
    { name: 'IMG_1809', width: 1959, height: 2991 },
  ],
};

export const WOOD: Gallery = {
  folder: 'wood',
  title: 'Wood',
  photos: [
    { name: 'DSC6731', width: 3678, height: 4016 },
    { name: 'DSC6914', width: 6016, height: 4016 },
    { name: 'DSC6965', width: 6016, height: 4016 },
  ],
};
