// dllmain.cpp : Defines the entry point for the DLL application.
#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files
#include <windows.h>
#include <iostream>
#include "SDK/Client/Client.h"

Client AClient;

DWORD WINAPI Main(HMODULE hModule)
{
    while (!GetAsyncKeyState(VK_END)) {
        AClient.Run();
    }

    return TRUE;
}

BOOL APIENTRY DllMain( HMODULE hModule,
                       DWORD  ul_reason_for_call,
                       LPVOID lpReserved
                     )
{
    switch (ul_reason_for_call)
    {
    case DLL_PROCESS_ATTACH:

        if (!AClient.init(true))
            break;

        std::cout << "Hello, Welcome back.\n";

        CreateThread(nullptr, 0, reinterpret_cast<LPTHREAD_START_ROUTINE>(Main), hModule, 0, nullptr);

        break;
    case DLL_PROCESS_DETACH:
        FreeLibraryAndExitThread(hModule, 0);
        break;
    }
    return TRUE;
}

