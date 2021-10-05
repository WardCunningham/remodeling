#include <stdio.h>

static int const MAGIC_GS = 0xb3;

int main(void)
{
	int ch;

	while ( (ch = getchar()) != EOF) {
		if (ch == MAGIC_GS) {
			fputs("<<<<gs>>>>", stdout);
		} else {
			putchar(ch);
		}
	}
}
