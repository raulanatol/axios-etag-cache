.DEFAULT_GOAL := build

init:
	@echo "🏃‍♀️ Starting project..."
	@npm install
	@cd demo && npm install

clean:
	@echo "🛁 Cleaning..."
	@npm run clean

clean_all:
	@echo "🧨 Clean all"
	@rm -Rf node_modules package-lock.json

test:
	@echo "Testing..."
	@npm run test

.PHONY: demo
demo:
	@cd demo && npm run start

demo-browser:
	@cd demo && npm run start-browser

build: clean test
	@echo "👩‍🏭 Building..."
	@npm run build
	@echo "✅"

publish: build
	@echo "📦 Publish package..."
	@./.scripts/publish.sh
