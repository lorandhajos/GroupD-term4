import time
from collections import namedtuple
from machine import UART, Pin
import struct

from circuitpython_typing import WriteableBuffer, ReadableBuffer
#we need to fix that

class ModemConfig():
    Bw125Cr45Sf128   = (0x72, 0x74, 0x04)
    Bw500Cr45Sf128   = (0x92, 0x74, 0x04)
    Bw31_25Cr48Sf512 = (0x48, 0x94, 0x04)
    Bw125Cr48Sf4096  = (0x78, 0xc4, 0x0c)

REG_00_FIFO = 0x00
REG_01_OP_MODE = 0x01
REG_02_BBITRATE_MSB = 0x02
REG_03_BITRATE_LSB = 0x03
REG_04_FDEV_MSB = 0x04
REG_05_FDEV_LSB = 0x05
REG_06_FRF_MSB = 0x06
REG_07_FRF_MID = 0x07
REG_08_FRF_LSB = 0x08
REG_09_PA_CONFIG = 0x09
REG_0A_PA_RAMP = 0x0A
REG_0B_OCP = 0x0B
REG_0C_LNA = 0x0C
REG_0D_FIFO_ADDR_PTR = 0x0D
REG_0E_FIFO_TX_BASE_ADDR = 0x0E
REG_0F_FIFO_RX_BASE_ADDR = 0x0F
REG_10_FIFO_RX_CURRENT_ADDR = 0x10
REG_11_IRQ_FLAGS_MASK = 0x11
REG_12_IRQ_FLAGS = 0x12
REG_13_RX_NB_BYTES = 0x13
REG_14_RX_HEADER_CNT_VALUE_MSB = 0x14
REG_15_RX_HEADER_CNT_VALUE_LSB = 0x15
REG_16_RX_PACKET_CNT_VALUE_MSB = 0x16
REG_17_RX_PACKET_CNT_VALUE_LSB = 0x17
REG_18_MODEM_STAT = 0x18
REG_19_PKT_SNR_VALUE =0x19
REG_1A_PKT_RSSI_VALUE = 0x1A
REG_1B_RSSI_VALUE = 0x1B
REG_1C_HOP_CHANNEL = 0x1C
REG_1D_MODEM_CONFIG1 = 0x1D
REG_1E_MODEM_CONFIG2 = 0x1E
REG_1F_SYMB_TIMEOUT_LSB = 0x1F
REG_20_PREAMBLE_MSB = 0x20
REG_21_PREAMBLE_LSB = 0x21
REG_22_PAYLOAD_LENGTH = 0x22
REG_23_MAX_PAYLOAD_LENGTH = 0x23
REG_24_HOP_PERIOD = 0x24
REG_25_FIFO_RX_BYTE_ADDR = 0x25
REG_26_MODEM_CONFIG3 = 0x26
REG_27_SYNC_CONFIG = 0x27
REG_28_SYNC_VALUE1 = 0x28
REG_29_SYNC_VALUE2 = 0x29
REG_2A_SYNC_VALUE3 = 0x2A
REG_2B_SYNC_VALUE4 = 0x2B
REG_2C_SYNC_VALUE5 = 0x2C
REG_2D_SYNC_VALUE6 = 0x2D
REG_2E_SYNC_VALUE7 = 0x2E
REG_2F_SYNC_VALUE8 = 0x2F
REG_30_PACKET_CONFIG1 = 0x30
REG_31_PACKET_CONFIG2 = 0x31
REG_32_PAYLOAD_LENGTH = 0x32
REG_33_NODE_ADRS = 0x33
REG_34_BROADCAST_ADRS = 0x34
REG_35_FIFO_THRESH = 0x35
REG_36_SEQ_CONFIG1 = 0x36
REG_37_SEQ_CONFIG2 = 0x37
REG_38_TIMER_RESOL = 0x38
REG_39_TIMER1_COEF = 0x39
REG_3A_TIMER2_COEF = 0x3A
REG_3B_IMAGE_CAL = 0x3B
REG_3C_TEMP = 0x3C
REG_3D_LOW_BAT = 0x3D
REG_3E_IRQ_FLAGS1 = 0x3E
REG_3F_IRQ_FLAGS2 = 0x3F
REG_40_DIO_MAPPING1 = 0x40
REG_41_DIO_MAPPING2 = 0x41
REG_42_VERSION = 0x42

REG_44_PLL_HOP = 0x44

REG_4B_TCXO = 0x4B
REG_4D_PA_DAC = 0x4D
REG_5B_FORMER_TEMP = 0x5B
REG_61_AGC_REF = 0x61
REG_62_AGC_THRESH1 = 0x62
REG_63_AGC_THRESH2 = 0x63
REG_64_AGC_THRESH3 = 0x64

PA_DAC_DISABLE = 0x04
PA_DAC_ENABLE = 0x07

# The crystal oscillator frequency of the module
FXOSC = 32000000.0

# The Frequency Synthesizer step = RH_RF95_FXOSC / 2^^19
FSTEP = FXOSC / 524288

# User facing constants:
SLEEP_MODE = 0b000
STANDBY_MODE = 0b001
FS_TX_MODE = 0b010
TX_MODE = 0b011
FS_RX_MODE = 0b100
RX_MODE = 0b101

LONG_RANGE_MODE = 0x80
MODE_SLEEP = 0x00
MODE_STDBY = 0x01
MODE_TX = 0x03
MODE_RXCONTINUOUS = 0x05
MODE_CAD = 0x07

def read_into(address:int, buf: WriteableBuffer, length: Optional[int] = None) -> None:
    pass
    #if length is None:
        #length = len(buf)

def read_u8(register):
    uart.write(b'R')
    uart.write(struct.pack("b", register & ~0x80))
    uart.write(b"\x01")

    while True:
        if uart.any():
            return struct.unpack("B", uart.read(1))[0]

def write_u8(register, value):
   uart.write(b'W')
   uart.write(struct.pack("B", register | 0x80))
   uart.write(b"\x01")
   uart.write(struct.pack("B", value))

def get_bit(byteval,idx):
    return int(((byteval&(1<<idx))!=0));

class RegisterBits:
    def __init__(self, address, offset = 0, bits = 1):
        assert 0 <= offset <= 7
        assert 1 <= bits <= 8
        assert (offset + bits) <= 8
        self._address = address
        self._mask = 0
        for _ in range(bits):
            self._mask <<= 1
            self._mask |= 1
        self._mask <<= offset
        self._offset = offset

    def __get__(self):
        reg_value = read_u8(self._address)
        return (reg_value & self._mask) >> self._offset

    def __set__(self, val):
        reg_value = read_u8(self._address)
        reg_value &= ~self._mask
        reg_value |= (val & 0xFF) << self._offset
        write_u8(self._address, reg_value)
    
    def reset(self) -> None:
        self._reset.value = False
        time.sleep(0.0001)
        self._reset.value = True
        time.sleep(0.005)
    
    def idle(self) -> None:
        self.operation_mode = STANDBY_MODE
        
    def sleep(self) -> None:
        self.operation_mode = SLEEP_MODE
    
    def listen(self) -> None:
        self.operation_mode = RX_MODE
        self.dio0_mapping = 0b00
        
    def transmit(self) -> None:
        self.operation_mode = TX_MODE
        self.dio0_mapping = 0b01

bw_bins = (7800, 10400, 15600, 20800, 31250, 41700, 62500, 125000, 250000)

def signal_bandwidth(val):
    for bw_id, cutoff in enumerate(bw_bins):
        if val <= cutoff:
            break
    else:
        bw_id = 9
    write_u8(REG_1D_MODEM_CONFIG1, (read_u8(REG_1D_MODEM_CONFIG1) & 0x0F) | (bw_id << 4),)
    if val >= 500000:
        # see Semtech SX1276 errata note 2.3
        variables[REG_31_PACKET_CONFIG2]["AutoIfOn"] = True
        # see Semtech SX1276 errata note 2.1
        if variables[REG_01_OP_MODE]["LowFrequencyModeOn"] == 1:
            write_u8(0x36, 0x02)
            write_u8(0x3A, 0x7F)
        else:
            write_u8(0x36, 0x02)
            write_u8(0x3A, 0x64)
    else:
        # see Semtech SX1276 errata note 2.3
        variables[REG_31_PACKET_CONFIG2]["AutoIfOn"] = False
        write_u8(0x36, 0x03)
        if val == 7800:
            write_u8(0x2F, 0x48)
        elif val >= 62500:
            # see Semtech SX1276 errata note 2.3
            write_u8(0x2F, 0x40)
        else:
            write_u8(0x2F, 0x44)
        write_u8(0x30, 0)

def coding_rate(val):
    denominator = min(max(val, 5), 8)
    cr_id = denominator - 4
    write_u8(REG_1D_MODEM_CONFIG1, (read_u8(REG_1D_MODEM_CONFIG1) & 0xF1) | (cr_id << 1))

def spreading_factor(val):
    # Set spreading factor (set to 7 to match RadioHead Sf128).
    val = min(max(val, 6), 12)

    if val == 6:
        variables[REG_31_PACKET_CONFIG2]["DetectionOptimize"] = 0x5
    else:
         variables[REG_31_PACKET_CONFIG2]["DetectionOptimize"] = 0x3

    write_u8(REG_37_SEQ_CONFIG2, 0x0C if val == 6 else 0x0A)
    write_u8(REG_1E_MODEM_CONFIG2, ((read_u8(REG_1E_MODEM_CONFIG2) & 0x0F) | ((val << 4) & 0xF0)))

def enable_crc(val):
    # Optionally enable CRC checking on incoming packets.
    if val:
        write_u8(REG_1E_MODEM_CONFIG2, read_u8(REG_1E_MODEM_CONFIG2) | 0x04)
    else:
        write_u8(REG_1E_MODEM_CONFIG2, read_u8(REG_1E_MODEM_CONFIG2) & 0xFB)

def tx_power(val):
    val = int(val)
    if high_power:
        if val < 5 or val > 23:
            raise RuntimeError("tx_power must be between 5 and 23")
        # Enable power amp DAC if power is above 20 dB.
        # Lower setting by 3db when PA_BOOST enabled - see Data Sheet  Section 6.4
        if val > 20:
            variables[REG_4D_PA_DAC]["PaDac"] = PA_DAC_ENABLE
            val -= 3
        else:
            variables[REG_4D_PA_DAC]["PaDac"] = PA_DAC_DISABLE
        variables[REG_09_PA_CONFIG]["PaSelect"] = True
        variables[REG_09_PA_CONFIG]["OutputPower"] = (val - 5) & 0x0F
    else:
        assert -1 <= val <= 14
        variables[REG_09_PA_CONFIG]["PaSelect"] = False
        variables[REG_09_PA_CONFIG]["MaxPower"] = 0b111 # Allow max power output.
        variables[REG_09_PA_CONFIG]["OutputPower"] = (val + 1) & 0x0F

def write_from(address, buf, length = None):
    if length is None:
        length = len(buf)

    uart.write(b'W')
    uart.write(struct.pack("B", (address | 0x80) & 0xFF))
    uart.write(struct.pack("B", length))
    uart.write(buf)

def send(data, destination, node, identifier, flags):
    assert 0 < len(data) <= 252

    variables[REG_01_OP_MODE]["Mode"] = STANDBY_MODE

    # Fill the FIFO with a packet to send.
    write_u8(REG_0D_FIFO_ADDR_PTR, 0x00)  # FIFO starts at 0.

    payload = bytearray(4)
    payload[0] = destination
    payload[1] = node
    payload[2] = identifier
    payload[3] = flags

    payload = payload + data
    
    # Write payload.
    write_from(REG_00_FIFO, payload)
    # Write payload and header length.
    write_u8(REG_22_PAYLOAD_LENGTH, len(payload))
    
    # Turn on transmit mode to send out the packet.
    variables[REG_01_OP_MODE]["Mode"] = TX_MODE
    variables[REG_40_DIO_MAPPING1]["Dio0Mapping"] = 0b01

    variables[REG_01_OP_MODE]["Mode"] = STANDBY_MODE
    
    # Clear interrupt.
    write_u8(REG_12_IRQ_FLAGS, 0xFF)

def receive(
        keep_listening: bool = True, with_header: bool = False, with_ack: bool = False, ack_delay: Optional[float] = 0.001, timeout: Optional[float] = 2
    ) -> Optional[bytearray]:
    timed_out = False
    
    if not timed_out:
        fifo_length = read_u8(REG_13_RX_NB_BYTES)
        
        if fifo_length > 0:
            current_address = read_u8(REG_10_FIFO_RX_CURRENT_ADDR)
            write_u8(REG_0D_FIFO_ADDR_PTR, current_address)
            packet = bytearray(fifo_length)
            
            if fifo_length < 5:
                packet = None
            else:
                #We check if broadcast adress is the first register of the packet, Not sure weather this is correct???????
                if packet[0] == REG_34_BROADCAST_ADRS:
                    packet = None
                elif with_ack and ((packet[3] ==0) and packet[0] != REG_34_BROADCAST_ADRS):
                    
                    if ack_delay is not None:
                        time.sleep(ack_delay)
                        #delay to send back
                    send(b"!", packet[1], packet[0], packet[2], packet[3])
            
    
    
    
# ========== Variables ==========
#
# 0x00 - 0x64 FSK/OOK Mode Registers
# 0x00 - 0x3F LoRa Mode Registers
#
# 0x61 - 0x70 Low Frequency Additional Registers
# 0x61 - 0x70 High Frequency Additional Registers

variables = {REG_00_FIFO: {
                "Fifo": RegisterBits(REG_00_FIFO, 0, 7)
            },
            REG_01_OP_MODE: {
                "LongRangeMode": RegisterBits(REG_01_OP_MODE, 7, 1),
                "ModulationType": RegisterBits(REG_01_OP_MODE, 5, 2),
                "LowFrequencyModeOn": RegisterBits(REG_01_OP_MODE, 3, 1),
                "Mode": RegisterBits(REG_01_OP_MODE, 0, 3)
            },
            REG_09_PA_CONFIG: {
                "PaSelect": RegisterBits(REG_09_PA_CONFIG, 7, 1),
                "MaxPower": RegisterBits(REG_09_PA_CONFIG, 4, 3),
                "OutputPower": RegisterBits(REG_09_PA_CONFIG, 0, 4)
            },
            REG_4D_PA_DAC: {
                "PaDac": RegisterBits(REG_4D_PA_DAC, 0, 3),
            },
            # lora only
            REG_26_MODEM_CONFIG3: {
                "AgcAutoOn": RegisterBits(REG_26_MODEM_CONFIG3, 2, 1)
            },
            REG_31_PACKET_CONFIG2: {
                "AutoIfOn": RegisterBits(REG_31_PACKET_CONFIG2, 7, 1),
                "DetectionOptimize": RegisterBits(REG_31_PACKET_CONFIG2, 0, 3)
            },
            REG_40_DIO_MAPPING1: {
                "Dio0Mapping": RegisterBits(REG_40_DIO_MAPPING1, 6, 2)
            }}

# ========== General Settings ==========

frequency = 868.0
high_power = False
agc = False
crc = True

# ========== Main ==========

uart = UART(1, baudrate=57600, tx=Pin(4), rx=Pin(5))

print("Uart initialized! Waiting for module to boot up...")

#time.sleep(20) # wait for the module to boot up

version = read_u8(REG_42_VERSION)
print("Version: ", version)

if version != 18:
    raise RuntimeError("Unexpected RFM9x version!")

# Set sleep mode, wait 1s and confirm in sleep mode (basic device check).
# Also set long range mode (LoRa mode) as it can only be done in sleep.
variables[REG_01_OP_MODE]["Mode"] = SLEEP_MODE

time.sleep(1)

variables[REG_01_OP_MODE]["LongRangeMode"] = 1

if variables[REG_01_OP_MODE]["Mode"] != SLEEP_MODE and variables[REG_01_OP_MODE]["LongRangeMode"] != 1:
    raise RuntimeError("Failed to configure radio for LoRa mode!")

# clear default setting for access to LF registers if frequency > 525MHz
if frequency > 525:
    variables[REG_01_OP_MODE]["LowFrequencyModeOn"] = 0

# Setup entire 256 byte FIFO
write_u8(REG_0E_FIFO_TX_BASE_ADDR, 0)
write_u8(REG_0F_FIFO_RX_BASE_ADDR, 0)

# Set mode idle
variables[REG_01_OP_MODE]["Mode"] = STANDBY_MODE

# Set frequency
frf = int((frequency * 1000000.0) / FSTEP)
write_u8(REG_06_FRF_MSB, (frf >> 16) & 0xff)
write_u8(REG_07_FRF_MID, (frf >> 8) & 0xff)
write_u8(REG_08_FRF_LSB, frf & 0xff)

# Set preamble length to 8 (default 8 bytes to match radiohead).
write_u8(REG_20_PREAMBLE_MSB, 0)
write_u8(REG_21_PREAMBLE_LSB, 8)

# Defaults set modem config to RadioHead compatible Bw125Cr45Sf128 mode.
signal_bandwidth(125000)
coding_rate(5)
spreading_factor(7)
enable_crc(crc)

# set AGC - Default = False
variables[REG_26_MODEM_CONFIG3]["AgcAutoOn"] = agc

# Set transmit power to 13 dBm, a safe value any module supports.
tx_power(13)

send(b'Hello', 0, 0, 0, 0)

print("Done!")

register_bits = RegisterBits(0, 0, 4)
register_bits.listen()