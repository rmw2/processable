#include <stdio.h>

int main(int argc, char **argv) {
    int a = 0, b = 0, c;
    char BUF[100];

    printf("\"%%dpoop%%d\" > ");
    c = scanf("%dpoop%d", &a, &b);
    printf("read: \"%d %d\" (returned %d)\n", a,b,c);

    scanf("%s", BUF);
    printf("buf: %s\n", BUF);

    return 0;
}