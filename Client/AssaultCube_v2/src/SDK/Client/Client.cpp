#include "Client.h"
#include <Windows.h>
#include <iostream>


FILE* console_stream;

bool Client::init(bool allocate_console)
{
	if (allocate_console) {
		AllocConsole();
		freopen_s(&console_stream, "CONOUT$", "w", stdout);
	}

	BasePtr = (uintptr_t)GetModuleHandleA(NULL);
	if (!BasePtr)
		return false;

	LocalPlayer = *(entPlayer**)(BasePtr + 0x10F4F4);
}

void Client::Run()
{
	if (LocalPlayer) {
		printf("localPlayer Health -> [%d]\n", LocalPlayer->Health);
	}
}

void Client::Unoad()
{
	if (console_stream) {
		fclose(console_stream);
		FreeConsole();
	}
}
