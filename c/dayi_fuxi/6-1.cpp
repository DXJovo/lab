#include<stdio.h>
#include<stdlib.h>

#define MAX 10e9
int arr[1001] = { 0 };

int get_num(int a, int b)
{
	return a > b ? a - b : b - a;
}

int main()
{
	int n;
	scanf("%d", &n);
	for (int i = 0; i < n; i++)
		scanf("%d", &arr[i]);
	for (int i = 1; i < n; i++)
	{
		int get = MAX, Pi = 0, cnm = MAX;
		for (int j = 0; j < i; j++)
		{
			int num = get_num(arr[i], arr[j]);
			if (num < get)
			{
				cnm = arr[j];
				get = num;
				Pi = j + 1;
			}
			else if(num == get && arr[j] < cnm)
			{
				get = num;
				Pi = j + 1;
			}
		}
		printf("%d %d\n", get, Pi);
	}
}