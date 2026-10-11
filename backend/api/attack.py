import threading
import uuid

import cryptage.main as main

MAX_ATTACKS = 100
_state_lock = threading.Lock()
_attacks = {}
_attack_order = []


class AttackSteps(list):
    def __init__(self, initial=()):
        super().__init__(initial)
        self._lock = threading.Lock()

    def append(self, item):
        with self._lock:
            super().append(item)

    def clear(self):
        with self._lock:
            super().clear()

    def snapshot(self):
        with self._lock:
            return list(self)


def begin_attack():
    attack_id = uuid.uuid4().hex
    steps = AttackSteps()
    with _state_lock:
        _attacks[attack_id] = steps
        _attack_order.append(attack_id)
        while len(_attack_order) > MAX_ATTACKS:
            oldest = _attack_order.pop(0)
            _attacks.pop(oldest, None)
    return attack_id, steps


def snapshot(attack_id):
    with _state_lock:
        steps = _attacks.get(attack_id)
    if steps is None:
        return None
    return steps.snapshot()


def call_substitution_attack(cipher, steps):
    traduction, traduction_sur, message_split, ponctuation = main.etape1(cipher, steps)
    main.etape2(cipher, traduction, traduction_sur, message_split, ponctuation, steps)


def start(cipher):
    attack_id, steps = begin_attack()
    thread = threading.Thread(
        target=call_substitution_attack,
        args=(cipher, steps),
    )
    thread.daemon = True
    thread.start()
    return attack_id
