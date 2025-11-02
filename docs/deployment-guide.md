# 🌐 SmartReview AI - Web環境デプロイガイド

## 開発段階でのWeb環境確認方法

### 方法1: ngrok（最も簡単・即座に使える）

**特徴**: ローカル環境をそのままWeb公開、無料、設定不要

```bash
# ngrokセットアップスクリプトを実行
cd scripts
setup-ngrok.bat
```

**メリット**:
- ✅ 5分で公開可能
- ✅ HTTPSで安全なアクセス
- ✅ スマホからもテスト可能
- ✅ 無料プランで十分

**使用例**:
```
Frontend URL: https://abc123.ngrok.io
Backend URL:  https://xyz789.ngrok.io
```

---

### 方法2: Render + Vercel（本番に近い環境）

**特徴**: 本番環境と同じ構成、無料枠あり、自動デプロイ

#### Step 1: Renderでバックエンドをデプロイ

1. [Render.com](https://render.com)でアカウント作成
2. GitHubリポジトリを連携
3. 新しいWeb Serviceを作成:
   - **Name**: smartreview-api
   - **Root Directory**: backend
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. 環境変数を設定:
   - `OPENAI_API_KEY`: あなたのAPIキー
   - `APP_ENV`: production

#### Step 2: Vercelでフロントエンドをデプロイ

1. [Vercel.com](https://vercel.com)でアカウント作成
2. GitHubリポジトリをインポート
3. 設定:
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: `npm run build`
   - **Output Directory**: dist
4. 環境変数を設定:
   - `VITE_API_URL`: RenderのバックエンドURL

**デプロイコマンド**:
```bash
# Vercel CLIでデプロイ
npm i -g vercel
cd frontend
vercel --prod
```

---

### 方法3: Railway（オールインワン）

**特徴**: バックエンドとフロントエンドを一箇所で管理

1. [Railway.app](https://railway.app)でアカウント作成
2. GitHubから新プロジェクト作成
3. 環境変数設定
4. デプロイ完了！

```bash
# Railway CLIでデプロイ
npm i -g @railway/cli
railway login
railway up
```

---

### 方法4: Netlify（フロントエンド特化）

**特徴**: フロントエンド専用、超高速CDN

```bash
# Netlify CLIでデプロイ
npm i -g netlify-cli
cd frontend
npm run build
netlify deploy --prod --dir=dist
```

---

### 方法5: Google Cloud Run（本格的）

**特徴**: プロフェッショナル環境、スケーラブル

```bash
# Cloud Runへデプロイ
gcloud run deploy smartreview-backend \
  --source backend \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy smartreview-frontend \
  --source frontend \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 📱 モバイル実機テスト

### QRコードでアクセス

デプロイ後、URLをQRコード化してスマホでテスト:

```python
# QRコード生成スクリプト
import qrcode

url = "https://your-app.ngrok.io"
qr = qrcode.QRCode(version=1)
qr.add_data(url)
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.save("app-qr.png")
```

---

## 🔧 環境別の設定

### 開発環境
```env
APP_ENV=development
DEBUG=True
CORS_ORIGINS=["http://localhost:3000"]
```

### ステージング環境
```env
APP_ENV=staging
DEBUG=True
CORS_ORIGINS=["https://staging.smartreview.app"]
```

### 本番環境
```env
APP_ENV=production
DEBUG=False
CORS_ORIGINS=["https://smartreview.app"]
```

---

## 🚀 推奨デプロイフロー

### 開発初期（今すぐ試したい）
→ **ngrok** を使用

### プロトタイプ共有
→ **Render + Vercel** の無料プランを使用

### 本番環境
→ **Google Cloud Run** または **AWS** を使用

---

## 📊 各サービス比較

| サービス | 料金 | セットアップ時間 | 特徴 |
|---------|------|-----------------|------|
| ngrok | 無料〜 | 5分 | 即座に公開、一時的 |
| Render | 無料〜 | 15分 | 自動デプロイ、永続的 |
| Vercel | 無料〜 | 10分 | 高速CDN、フロントエンド特化 |
| Railway | $5〜/月 | 10分 | 簡単、統合環境 |
| Netlify | 無料〜 | 10分 | CI/CD統合、高速 |
| Cloud Run | 従量課金 | 30分 | スケーラブル、本格的 |

---

## 🔒 セキュリティ注意事項

1. **APIキーの管理**
   - 環境変数で管理
   - .envファイルはGitにコミットしない
   - 各サービスのSecret機能を使用

2. **CORS設定**
   - 本番環境では特定のドメインのみ許可
   - 開発環境とは別設定

3. **HTTPS必須**
   - すべてのサービスでHTTPS有効化
   - HTTP→HTTPSリダイレクト設定

---

## 📝 トラブルシューティング

### ngrokが繋がらない
```bash
# ファイアウォール設定確認
netsh advfirewall firewall show rule name=all
```

### Renderデプロイが失敗
```bash
# ログ確認
render logs --service smartreview-api --tail
```

### Vercelビルドエラー
```bash
# ローカルでビルドテスト
cd frontend
npm run build
```

---

## 📞 サポート

問題が発生した場合:
1. 各サービスのドキュメント確認
2. デプロイログを確認
3. 環境変数の設定を再確認

---

これで開発段階から本番まで、様々なWeb環境でテスト可能です！