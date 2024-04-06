#pragma once
#include <cinttypes>
#include "../Game/entPlayer.h"

class Client
{
public:
	// Functions
	bool init(bool allocate_console = false);
	void Run();
	void Unoad();

	// Members
	entPlayer* LocalPlayer;
private:
	uintptr_t BasePtr;
};

