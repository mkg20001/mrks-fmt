install:
	nix-shell -p bundler --run "bundle install --gemfile=Gemfile --path vendor/cache"
serve:
	nix-shell -p bundler --run "bundle exec jekyll serve"
build:
	nix-shell -p bundler --run "bundle exec jekyll build"
