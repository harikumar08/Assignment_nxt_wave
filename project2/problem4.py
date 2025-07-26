from math import inf
prices = list(map(int, input().split()))
min_val = inf
buy = -1
sell = -1
for i in range(len(prices)):
    for j in range(i+1,len(prices)):
        if(prices[i] > prices[j]) and (prices[i]-prices[j] < min_val):
            buy = prices[i]
            sell = prices[j]
            min_val = prices[i] - prices[j]
print(f"year to buy: {buy},  sell in: {sell}, loss value: {min_val}")
