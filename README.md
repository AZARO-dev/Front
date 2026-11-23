# rerun — vintage anime tees

海外のアニメファン向け、日本のアニメ古着Tシャツ通販サイト（英語）。
白ベース・黒文字の、アーティストの個人ショップのような静かなデザインです。

ビルド不要の静的サイト（HTML / CSS / JavaScript のみ）なので、GitHub Pages や Netlify にそのまま置けます。

## ページ

| ファイル | 内容 |
| --- | --- |
| `index.html` | ショップ一覧（年代フィルター・在庫ありのみ表示・並び替え） |
| `product.html#商品ID` | 商品詳細（写真3枚・採寸・状態ランク・関連商品） |
| `cart.html` | カート（送料計算・送料無料ラインの表示） |
| `about.html` | ショップについて |
| `info.html` | 配送・サイズ・状態ランク・返品・FAQ・連絡先 |

## 商品の追加・編集

`assets/js/products.js` を編集するだけです。

```js
{
  id: "mecha-pilot-95",            // URLに使うID（英数字とハイフン）
  title: "Mecha Pilot Movie Promo Tee",
  year: 1995,                       // 年代フィルター（80s / 90s / 00s）に使用
  category: "Movie promo",
  size: "L",
  price: 128,                       // USD
  sold: false,                      // 売れたら true（SOLD表示になりカートに入れられなくなる）
  isNew: true,                      // NEWバッジ
  pit: 54, length: 71,              // 身幅・着丈（cm。インチは自動計算）
  condition: "B",                   // A / B / C
  conditionNote: "Even fade overall, tiny pinhole near hem.",
  fabric: "100% cotton",
  stitch: "Single stitch",
  madeIn: "Japan",
  license: "Official",
  description: "…",
  images: [],                       // 写真のパス（下記）
  color: "#2a2a2c", ink: "#e8e2d4", motif: "sun", label: "1995", // 写真がない時の仮イラスト用
}
```

古着は1点ものなので在庫数はありません。売れたら `sold: true` にしてください。

### 写真

`assets/img/products/` に写真を置き、`images` に並べます（1枚目＝正面、2枚目＝背面、3枚目＝タグ、の順がおすすめ）。

```js
images: [
  "assets/img/products/mecha-pilot-95-front.jpg",
  "assets/img/products/mecha-pilot-95-back.jpg",
  "assets/img/products/mecha-pilot-95-tag.jpg",
],
```

一覧では1枚目が表示され、マウスを乗せると2枚目に切り替わります。縦長（4:5）の写真がきれいに収まります。
`images` が空の商品には、仮のTシャツのイラストが表示されます。

## ショップ設定

`assets/js/products.js` の先頭の `window.SHOP` で、ショップ名・送料・送料無料ライン・ドロップ番号・Instagram・メールアドレスを変更できます。

## フォント・色

`assets/css/style.css` の先頭の変数で全体を変えられます。

- `--font-display` … 見出し・ロゴ（Instrument Serif）
- `--font-body` … 本文（Instrument Sans）
- `--font-mono` … 採寸表・ラベル（IBM Plex Mono）
- `--font-jp` … 日本語のアクセント（Zen Old Mincho）

フォントはGoogle Fontsから読み込んでいます（各HTMLの `<head>`）。

## ローカルで確認

`index.html` をダブルクリックしてブラウザで開くだけで動きます（サーバー不要）。

サーバー経由で確認したい場合：

```sh
python3 -m http.server 8000
# → http://localhost:8000
```

## 公開（GitHub Pages）

リポジトリの Settings → Pages で、公開するブランチとルート（`/`）を選ぶだけで公開できます。

## まだ繋がっていないもの

- **決済**：現在はデモモードです。`window.SHOP.checkoutUrl` に決済ページのURLを入れると、Checkoutボタンからそこへ移動します（カート内の商品IDが `?items=` で付きます）。
  Shopify（Buy Button / Storefront）、Stripe（Payment Links / Checkout）、BASE、STORES などとの連携が次のステップです。
- **メールマガジン登録**：フォームは見た目のみです。Mailchimp や Buttondown などのフォームURLに差し替えてください。
- **About ページの写真**：グレーの枠を実際の写真に差し替えてください。
