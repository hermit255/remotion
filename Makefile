.PHONY: create-movie render

# create movie コマンド
# 使用方法: make create-movie title=20260105
# titleが未設定の場合、実行時点のyyyyMMddが自動設定されます
create-movie:
	@TITLE=$$([ -z "$(title)" ] && date +%Y%m%d || echo "$(title)"); \
	if [ -z "$(title)" ]; then \
		echo "titleが未設定のため、実行時点の日付を設定: $$TITLE"; \
	fi; \
	echo "Creating movie for title: $$TITLE"; \
	if [ ! -f "src/projects/ZundaTalk/Z_$$TITLE.tsx" ]; then \
		cp src/projects/ZundaTalk/Z_template.tsx src/projects/ZundaTalk/Z_$$TITLE.tsx && \
		sed -i "s/const title = \"2025mmdd\";/const title = \"$$TITLE\";/" src/projects/ZundaTalk/Z_$$TITLE.tsx && \
		echo "✓ Created Z_$$TITLE.tsx"; \
	else \
		echo "⚠ Z_$$TITLE.tsx already exists, skipping copy"; \
	fi; \
	if [ ! -f "src/projects/ZundaTalk/messages/$$TITLE.json" ]; then \
		touch src/projects/ZundaTalk/messages/$$TITLE.json && \
		echo "✓ Created messages/$$TITLE.json"; \
	else \
		echo "⚠ messages/$$TITLE.json already exists, skipping creation"; \
	fi; \
	sed -i "s|from \"./projects/ZundaTalk/Z_[^\"]*\"|from \"./projects/ZundaTalk/Z_$$TITLE\"|" src/Root.tsx && \
	echo "✓ Updated Root.tsx to use Z_$$TITLE"; \
	echo "Done! Movie files created for title: $$TITLE"; \
	cursor src/projects/ZundaTalk/Z_$$TITLE.tsx || code src/projects/ZundaTalk/Z_$$TITLE.tsx; \
	cursor src/projects/ZundaTalk/messages/$$TITLE.json || code src/projects/ZundaTalk/messages/$$TITLE.json

# render コマンド
# 使用方法: make render title=20260105
# titleが未設定の場合、実行時点のyyyyMMddが自動設定されます
render:
	@TITLE=$$([ -z "$(title)" ] && date +%Y%m%d || echo "$(title)"); \
	if [ -z "$(title)" ]; then \
		echo "titleが未設定のため、実行時点の日付を設定: $$TITLE"; \
	fi; \
	if [ ! -d "out" ]; then \
		mkdir -p out && \
		echo "✓ Created out/ directory"; \
	fi; \
	echo "Rendering movie for title: $$TITLE"; \
	docker compose exec app npx remotion render ZundaMetanTalk out/$$TITLE.mp4 || \
		(echo "Error: Rendering failed" && exit 1); \
	echo "✓ Rendering completed: out/$$TITLE.mp4"
	
# psd コマンド
# 使用方法: make psd TARGET_FILE=metan
psd:
	@if [ -z "$(TARGET_FILE)" ]; then \
		echo "Error: TARGET_FILE引数が必要です。例: make psd TARGET_FILE=metan"; \
		exit 1; \
	fi
	@docker compose --profile psd run --rm python python /app/export_layers.py $(TARGET_FILE)