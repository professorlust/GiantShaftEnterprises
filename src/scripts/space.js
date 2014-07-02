function SpaceController($scope, playerService, gameService) {
	// The current asteroid you scanned for that you can potentially mine
	$scope.current = null;

	$scope.playerService = playerService;
	$scope.gameService = gameService;

	// Returns a random asteroid that fits the difficulty
	// 		miningCost 	- How much it costs every time you mine the asteroid
	//		chance		- % chance that mining will return any valuables
	//		maxPerMine	- maximum amount of minerals you can earn when the mining is successful
	//		resources	- array of what resources and how many of each are on the specific asteroid
	$scope.scanForAsteroid = function(difficulty)
	{
		// TODO: Change this from temporary spiked out test data to the real deal!
		if(difficulty == 0)
			$scope.current = { miningCost: 100000, chance: 10, maxPerMine: 2, resources: [ {name: 'Titanium', remaining: 100}, {name: 'Diamond', remaining: 25} ]};
		else
			$scope.current = null;
	}

	// Return array of the minerals from the mine (or nothing if mining failed)
	$scope.mine = function() {
		var as = $scope.current,
				 successfulMine = Math.random() * 100 < as.chance,
				 mined = [], mineralsToMine;

		playerService.money -= $scope.current.miningCost;
		if(!successfulMine) return;

		mineralsToMine = Math.floor((Math.random() * as.maxPerMine) + 1);
		for(var i = 0; i < mineralsToMine; i++) {
			var mineral = Math.floor(Math.random() * as.resources.length);

			as.resources[mineral].remaining--;
			if(as.resources[mineral].remaining <= 0)
				as.resources.splice(mineral, 1);

			mined.push({ name: as.resources[mineral].name });
		}

		playerService.mine(mined);
	}

	$scope.abandon = function() {
		$scope.current = null;
	}

	$scope.getCount = function(id) {
		var ship = playerService.ships.filter(function(d) {return d.id == id;});
		return ship.length == 1 ? ship[0].count : 0;
	}

	$scope.buy = function(id, amount) {
		if($scope.canBuy(id, amount, false)) {
			$scope.canBuy(id, amount, true);

			var ship = playerService.ships.filter(function(d) {return d.id == id;});
			if(ship.length > 0) {
				//over 0 means the ship was already bought at least once, meaning we just need to increment the counter
				ship = ship[0];
				ship.count++;
			}
			else {
				playerService.ships.push({id: id, count: amount});
			}
		}
	}

	// Returns if player can buy a specific ship.  Passing in true for the 'buy' 
	// value will also remove the resources when checking if you have enough
	$scope.canBuy = function(id, amount, buy) {
		var ship = gameService.ships.filter(function(d) {return d.id == id;})[0];

		var buyable = true;

		for(var i = 0; i < ship.cost.length; i++) {
			if(ship.cost[i].name == 'Money'){
				buyable &= playerService.money >= ship.cost[i].price * amount;
				if(buy) playerService.money -= ship.cost[i].price * amount;
			}
			else {
				var resource = playerService.resources.filter(function(d) {return d.name == ship.cost[i].name});
				if(resource.length > 0) resource = resource[0];
				else resource = {};

				buyable &= resource.count >= ship.cost[i].price * amount;
				if(buy) resource.count -= ship.cost[i].price * amount;
			}
		}

		return buyable;
	}
}