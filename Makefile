up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

migrate:
	docker exec si_app php artisan migrate

fresh:
	docker exec si_app php artisan migrate:fresh --seed

bash-app:
	docker exec -it si_app bash

bash-db:
	docker exec -it si_postgres psql -U si_user -d si_inventaris