from pathlib import Path
from fontTools import subset
import argparse
parser=argparse.ArgumentParser(description="Subset self-hosted website fonts from upstream TTF files")
parser.add_argument("wenkai_ttf")
parser.add_argument("caveat_ttf")
args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
text=''.join(p.read_text() for p in [root/'index.html', *root.glob('assets/js/*.js')])+'稿纸黑板跟随系统减少动画跳过重新书写演算题解批注草稿待验证页前一页后一页原始笔记示意物理实验书写现场当前载体更换书写工具'
for source,target,chars in [(args.wenkai_ttf,'notebook-hand.woff2',text),(args.caveat_ttf,'caveat.woff2',''.join(chr(i) for i in range(32,591))+'ψφγωλπ²₀₁₂₃−→∞∫∂∑Δεμ̈̇')]:
 options=subset.Options(); options.flavor='woff2'
 font=subset.load_font(source, options)
 if target=='notebook-hand.woff2':
  for record in font['name'].names:
   if record.nameID in (1,3,4,6,16):
    record.string=('NotebookHand' if record.nameID==6 else 'Notebook Hand').encode(record.getEncoding())
 sub=subset.Subsetter(options); sub.populate(text=chars); sub.subset(font)
 subset.save_font(font, str(root/'assets/fonts'/target), options)
 print(target,(root/'assets/fonts'/target).stat().st_size)
