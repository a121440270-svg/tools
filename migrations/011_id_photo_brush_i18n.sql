-- Add multilingual labels for post-cutout brush cleanup.
DELETE FROM page_lang
WHERE route = 'all'
  AND key IN (
    'idPhoto.brushCutout',
    'idPhoto.brushSize',
    'idPhoto.brushSizeValue',
    'idPhoto.startPainting',
    'idPhoto.stopPainting',
    'idPhoto.removePaintedArea',
    'idPhoto.paintHint',
    'idPhoto.paintSuccess'
  );

INSERT OR IGNORE INTO page_lang (route, key, value, lang) VALUES
  ('all', 'idPhoto.brushCutout', '涂抹区域抠图', 'zh'),
  ('all', 'idPhoto.brushSize', '画笔大小', 'zh'),
  ('all', 'idPhoto.brushSizeValue', '{size}px', 'zh'),
  ('all', 'idPhoto.startPainting', '开始涂抹', 'zh'),
  ('all', 'idPhoto.stopPainting', '退出涂抹', 'zh'),
  ('all', 'idPhoto.removePaintedArea', '去除涂抹区域', 'zh'),
  ('all', 'idPhoto.paintHint', '请在图片上涂抹要去除的区域', 'zh'),
  ('all', 'idPhoto.paintSuccess', '涂抹区域已去除', 'zh'),

  ('all', 'idPhoto.brushCutout', 'Brush cleanup', 'en'),
  ('all', 'idPhoto.brushSize', 'Brush size', 'en'),
  ('all', 'idPhoto.brushSizeValue', '{size}px', 'en'),
  ('all', 'idPhoto.startPainting', 'Start painting', 'en'),
  ('all', 'idPhoto.stopPainting', 'Exit painting', 'en'),
  ('all', 'idPhoto.removePaintedArea', 'Remove painted area', 'en'),
  ('all', 'idPhoto.paintHint', 'Paint over the area you want to remove', 'en'),
  ('all', 'idPhoto.paintSuccess', 'Painted area removed', 'en'),

  ('all', 'idPhoto.brushCutout', 'Bereich übermalen und entfernen', 'de'),
  ('all', 'idPhoto.brushSize', 'Pinselgröße', 'de'),
  ('all', 'idPhoto.brushSizeValue', '{size}px', 'de'),
  ('all', 'idPhoto.startPainting', 'Übermalen starten', 'de'),
  ('all', 'idPhoto.stopPainting', 'Übermalen beenden', 'de'),
  ('all', 'idPhoto.removePaintedArea', 'Übermalten Bereich entfernen', 'de'),
  ('all', 'idPhoto.paintHint', 'Übermale den Bereich, den du entfernen möchtest', 'de'),
  ('all', 'idPhoto.paintSuccess', 'Übermalter Bereich entfernt', 'de'),

  ('all', 'idPhoto.brushCutout', 'Eliminación con pincel', 'es'),
  ('all', 'idPhoto.brushSize', 'Tamaño del pincel', 'es'),
  ('all', 'idPhoto.brushSizeValue', '{size}px', 'es'),
  ('all', 'idPhoto.startPainting', 'Empezar a pintar', 'es'),
  ('all', 'idPhoto.stopPainting', 'Salir del modo de pintura', 'es'),
  ('all', 'idPhoto.removePaintedArea', 'Eliminar área pintada', 'es'),
  ('all', 'idPhoto.paintHint', 'Pinta sobre el área que quieres eliminar', 'es'),
  ('all', 'idPhoto.paintSuccess', 'Área pintada eliminada', 'es'),

  ('all', 'idPhoto.brushCutout', 'Nettoyage au pinceau', 'fr'),
  ('all', 'idPhoto.brushSize', 'Taille du pinceau', 'fr'),
  ('all', 'idPhoto.brushSizeValue', '{size}px', 'fr'),
  ('all', 'idPhoto.startPainting', 'Commencer à peindre', 'fr'),
  ('all', 'idPhoto.stopPainting', 'Quitter le mode peinture', 'fr'),
  ('all', 'idPhoto.removePaintedArea', 'Supprimer la zone peinte', 'fr'),
  ('all', 'idPhoto.paintHint', 'Peignez la zone à supprimer', 'fr'),
  ('all', 'idPhoto.paintSuccess', 'Zone peinte supprimée', 'fr');
