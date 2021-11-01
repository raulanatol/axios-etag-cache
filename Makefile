.DEFAULT_GOAL := build

clean:
	@echo "🛁 Cleaning..."
	@yarn clean

clean_all:
	@echo "🧨 Clean all"
	@rm -Rf node_modules package-lock.json

test:
	@echo "Testing..."
	@yarn test

build: clean test
	@echo "👩‍🏭 Building..."
	@yarn build-all

publish: build
	@echo "📦 Publish package..."
	@./.scripts/publish.sh
