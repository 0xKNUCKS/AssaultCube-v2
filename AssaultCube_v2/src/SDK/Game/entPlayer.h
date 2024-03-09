#pragma once
#include <cstdint>
#include "../Math/math.h"

// Created with ReClass.NET by KN4CK3R

using Vector3 = math::Vector;

class Weapon_properties
{
public:
	char pad_0000[260]; //0x0000
	int16_t ShootSoundID; //0x0104
	int16_t ReloadSoundID; //0x0106
	int16_t ReloadWaitTime; //0x0108
	int16_t shootWaitTime; //0x010A
	int16_t Damage; //0x010C
	char pad_010E[4]; //0x010E
	int16_t GrenadeFactor; //0x0112
	int16_t Spread; //0x0114
	int16_t ThrowBack; //0x0116
	int16_t MaxBullets; //0x0118
	char pad_011A[6]; //0x011A
	int16_t SmolRecoil; //0x0120
	int16_t BigRecoil; //0x0122
	char pad_0124[4]; //0x0124
	bool isAuto; //0x0128
}; //Size: 0x0129

class Weapon_info
{
public:
	int32_t Mag; //0x0000
	char pad_0004[36]; //0x0004
	uint32_t Bullets; //0x0028
	char pad_002C[36]; //0x002C
	uint32_t curWaitTime; //0x0050
	char pad_0054[36]; //0x0054
	uint32_t ShotsCount; //0x0078
}; //Size: 0x007C

class Weapon
{
public:
	char pad_0000[4]; //0x0000
	int32_t id; //0x0004
	class entPlayer* owner; //0x0008
	class Weapon_properties* props; //0x000C
	class Weapon_info* info; //0x0010
}; //Size: 0x0014

class entPlayer
{
public:
	char pad_0000[4]; //0x0000
	Vector3 HeadPos; //0x0004
	Vector3 MoveVel; //0x0010
	Vector3 MovDirPressed; //0x001C
	char pad_0028[12]; //0x0028
	Vector3 Pos; //0x0034
	Vector3 ViewAngle; //0x0040
	char pad_004C[28]; //0x004C
	int16_t isOnGround; //0x0068
	char pad_006A[6]; //0x006A
	bool isIdle; //0x0070
	char pad_0071[15]; //0x0071
	uint16_t MoveFlag; //0x0080
	char pad_0082[10]; //0x0082
	bool isMovingLeft; //0x008C
	bool isMovingRight; //0x008D
	bool isMovingForward; //0x008E
	bool isMovingBack; //0x008F
	char pad_0090[104]; //0x0090
	int32_t Health; //0x00F8
	int32_t Armor; //0x00FC
	char pad_0100[88]; //0x0100
	int32_t Gernades; //0x0158
	char pad_015C[536]; //0x015C
	class Weapon* Weapon_obj; //0x0374
}; //Size: 0x0378

class info
{
public:
	char N00000184[4]; //0x0000
	char pad_0004[64]; //0x0004
}; //Size: 0x0044