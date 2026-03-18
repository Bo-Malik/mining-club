IMAGE=rg.fr-par.scw.cloud/blockmint/app:latest
CONTAINER_ID=5e415e9e-bcd9-4dc2-8f79-e663e542f100

SCW_ACCESS_KEY=SCWBFTZH7MECJNF144B4
SCW_SECRET_KEY=573f3a65-4726-4f8d-8323-a6a7589e9399

deploy:
	@echo "🔨 Building Docker image..."
	docker build -t $(IMAGE) .
	@echo "📤 Logging into Scaleway Registry..."
	docker login rg.fr-par.scw.cloud -u $(SCW_ACCESS_KEY) -p $(SCW_SECRET_KEY)
	@echo "📤 Pushing Docker image..."
	docker push $(IMAGE)
	@echo "🚀 Deploying container..."
	scw container container deploy $(CONTAINER_ID)
	@echo "✅ Deployment finished!"