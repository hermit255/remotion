.PHONY: create-movie render

# create movie コマンド
# 使用方法: make create-movie title=20260105
create-movie:
	@if [ -z "$(title)" ]; then \
		echo "Error: title引数が必要です。例: make create-movie title=20260105"; \
		exit 1; \
	fi
	@echo "Creating movie for title: $(title)"
	@# パート1: create tsx
	@if [ ! -f "src/projects/ZundaTalk/Z_$(title).tsx" ]; then \
		cp src/projects/ZundaTalk/Z_template.tsx src/projects/ZundaTalk/Z_$(title).tsx && \
		sed -i 's/const title = "2025mmdd";/const title = "$(title)";/' src/projects/ZundaTalk/Z_$(title).tsx && \
		echo "✓ Created Z_$(title).tsx"; \
	else \
		echo "⚠ Z_$(title).tsx already exists, skipping copy"; \
	fi
	@# パート2: create json
	@if [ ! -f "src/projects/ZundaTalk/messages/$(title).json" ]; then \
		touch src/projects/ZundaTalk/messages/$(title).json && \
		echo "✓ Created messages/$(title).json"; \
	else \
		echo "⚠ messages/$(title).json already exists, skipping creation"; \
	fi
	@# パート3: update root
	@sed -i 's|from "./projects/ZundaTalk/Z_[^"]*"|from "./projects/ZundaTalk/Z_$(title)"|' src/Root.tsx && \
	echo "✓ Updated Root.tsx to use Z_$(title)"
	@echo "Done! Movie files created for title: $(title)"

# render コマンド
# 使用方法: make render title=20260105
render:
	@if [ -z "$(title)" ]; then \
		echo "Error: title引数が必要です。例: make render title=20260105"; \
		exit 1; \
	fi
	@if [ ! -d "out" ]; then \
		mkdir -p out && \
		echo "✓ Created out/ directory"; \
	fi
	@echo "Rendering movie for title: $(title)"
	@docker compose exec app npx remotion render ZundaMetanTalk out/$(title).mp4 || \
		(echo "Error: Rendering failed" && exit 1)
	@echo "✓ Rendering completed: out/$(title).mp4"
	