#include<stdio.h>
#include<stdlib.h>

struct
{
    int data, num;
}arr[1001];

int len = 0, top = 0;

void L(int x)
{
    for (int i = len - 1; i >= 0; i--)
    {
        arr[i + 1] = arr[i];
    }
    arr[0].data = x;
    arr[0].num = ++top;
    len++;
}

void R(int x)
{
    arr[len].data = x;
    arr[len++].num = ++top;
}

void D(int k)
{
    for (int i = 0; i < len; i++)
    {
        if (arr[i].num == k)
        {
            for (int j = i; j < len; j++)
                arr[j] = arr[j + 1];
            len--;
            break;
        }
    }
}

void IL(int k, int x)
{
    for (int i = 0; i < len; i++)
    {
        if (arr[i].num == k)
        {
            for (int j = len - 1; j >= i; j--)
            {
                arr[j + 1] = arr[j];
            }
            arr[i].data = x;
            arr[i].num = ++top;
            len++;
            break;
        }
    }
}

void IR(int k, int x)
{
    for (int i = 0; i < len; i++)
    {
        if (arr[i].num == k)
        {
            for (int j = len - 1; j > i; j--)
                arr[j + 1] = arr[j];
            arr[i + 1].data = x;
            arr[i + 1].num = ++top;
            len++;
            break;
        }
    }
}

int main(void)
{
    int M = 0;
    scanf("%d", &M);
    for (int i = 0; i < M; i++)
    {
        char op[5] = { 0 };
        scanf("%s", op);
        switch (op[0])
        {
        case 'L':
        {
            int x;
            scanf("%d", &x);
            L(x);
            break;
        }
        case 'R':
        {
            int x;
            scanf("%d", &x);
            R(x);
            break;
        }
        case 'D':
        {
            int x;
            scanf("%d", &x);
            if(x >= 0 && x < len)
                D(x);
            break;
        }
        case 'I':
        {
            if (op[1] == 'L')
            {
                int k, x;
                scanf("%d %d", &k, &x);
                if (k >= 0 && k < len)
                    IL(k, x);
            }
            else if (op[1] == 'R')
            {
                int k, x;
                scanf("%d %d", &k, &x);
                if (k >= 0 && k < len)
                    IR(k, x);
            }
            break;
        }
        }
    }
    for (int i = 0; i < len; i++) 
        printf("%d ", arr[i].data);
    printf("\n");
}