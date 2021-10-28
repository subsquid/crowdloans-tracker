set -e
rm -rf db/migrations/*.js
npm run db:reset
npm run db:create-migration -n "auctiontest" 
npm run db:migrate